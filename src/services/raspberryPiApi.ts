/**
 * Raspberry Pi API Client
 * Raspberry Pi 上で動作するリモートコントローラー API との通信を行う
 */

// Raspberry Pi API のベース URL（環境変数から取得、デフォルトは localhost）
const PI_API_BASE_URL = process.env.NEXT_PUBLIC_PI_API_URL || 'http://localhost:8000';

// API レスポンスの型定義
export interface PowerStatusResponse {
  status: string;
  body: boolean;
}

export interface TemperatureResponse {
  status: string;
  body: number;
}

export interface RoomInfoResponse {
  status: string;
  room: string;
  usr: string;
  temparature: number; // スペルミスがあるが実際のAPIに合わせる
  power: boolean;
}

export interface SettingsResponse {
  status: string;
  id: string;
  Hard_name: string;
  room: string;
}

/**
 * API 呼び出しのベース関数
 */
async function apiCall<T>(endpoint: string): Promise<T> {
  const url = `${PI_API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // タイムアウト設定（10秒）
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 1. ルート - 動作確認用
 */
export async function checkApiHealth(): Promise<{ status: string; body: string }> {
  return apiCall('/');
}

/**
 * 2. 電源制御 - 現在状態取得
 */
export async function getPowerStatus(): Promise<PowerStatusResponse> {
  return apiCall('/control/power');
}

/**
 * 3. 温度アップ
 */
export async function increaseTemperature(): Promise<TemperatureResponse> {
  return apiCall('/control/temperature/up');
}

/**
 * 4. 温度ダウン
 */
export async function decreaseTemperature(): Promise<TemperatureResponse> {
  return apiCall('/control/temperature/down');
}

/**
 * 5. ルーム情報取得
 */
export async function getRoomInfo(): Promise<RoomInfoResponse> {
  return apiCall('/info/room');
}

/**
 * 6. 設定情報取得
 */
export async function getSettings(): Promise<SettingsResponse> {
  return apiCall('/info/settings');
}

/**
 * 高レベル API: Room データを既存の型に変換
 */
export async function getRoomData(roomId: string): Promise<{
  id: string;
  number: string;
  device: {
    id: string;
    model: string;
    status: string;
    set_temperature_c: number;
    actual_temperature_c: number;
    last_seen: string;
    signal_strength: number;
  };
  reservation: {
    reservation_id: string;
    guest_masked: string;
    check_in: string;
    preferences: {
      temperature_c: number;
    };
  } | null;
  commands: unknown[];
}> {
  try {
    const [roomInfo, settings] = await Promise.all([
      getRoomInfo(),
      getSettings(),
    ]);

    // 既存の Room 型に合わせて変換
    return {
      id: roomId,
      number: roomInfo.room,
      device: {
        id: `dev_${roomInfo.room}`,
        model: settings.Hard_name,
        status: 'online', // Pi API が応答していれば online とみなす
        set_temperature_c: roomInfo.temparature,
        actual_temperature_c: roomInfo.temparature, // Pi API では実測温度は別途取得が必要
        last_seen: new Date().toISOString(),
        signal_strength: -50, // 固定値（Pi API には含まれない）
      },
      reservation: roomInfo.usr !== '' ? {
        reservation_id: `res_${Date.now()}`,
        guest_masked: roomInfo.usr,
        check_in: new Date().toISOString(),
        preferences: {
          temperature_c: roomInfo.temparature,
        },
      } : null,
      commands: [], // コマンド履歴は別途管理が必要
    };
  } catch (error) {
    console.error('Failed to fetch room data:', error);
    // エラー時はオフライン状態として返す
    return {
      id: roomId,
      number: roomId.replace('room_', ''),
      device: {
        id: `dev_${roomId}`,
        model: 'Unknown',
        status: 'offline',
        set_temperature_c: 24,
        actual_temperature_c: 24,
        last_seen: new Date(Date.now() - 300000).toISOString(), // 5分前
        signal_strength: -100,
      },
      reservation: null,
      commands: [],
    };
  }
}

/**
 * 温度制御コマンドの実行
 */
export async function executeTemperatureCommand(
  roomId: string,
  action: 'increase' | 'decrease'
): Promise<{ success: boolean; newTemperature?: number; error?: string }> {
  try {
    const response = action === 'increase' 
      ? await increaseTemperature()
      : await decreaseTemperature();

    if (response.status === '200') {
      return {
        success: true,
        newTemperature: response.body,
      };
    } else {
      return {
        success: false,
        error: `API returned status: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 目標温度まで段階的に調整する
 */
export async function setTargetTemperature(
  roomId: string,
  targetTemperature: number
): Promise<{ success: boolean; finalTemperature?: number; stepsCompleted?: number; error?: string }> {
  try {
    // 現在温度を取得
    const roomInfo = await getRoomInfo();
    if (roomInfo.status !== '200') {
      return {
        success: false,
        error: `Failed to get current temperature: ${roomInfo.status}`,
      };
    }

    let currentTemp = roomInfo.temparature;
    const startTemp = currentTemp;
    let stepsCompleted = 0;
    const maxSteps = 10; // 無限ループ防止

    console.log(`Temperature adjustment: ${startTemp}°C → ${targetTemperature}°C`);

    // 目標温度まで1度ずつ調整
    while (currentTemp !== targetTemperature && stepsCompleted < maxSteps) {
      const action = targetTemperature > currentTemp ? 'increase' : 'decrease';
      const result = await executeTemperatureCommand(roomId, action);

      if (!result.success) {
        return {
          success: false,
          error: `Failed at step ${stepsCompleted + 1}: ${result.error}`,
          stepsCompleted,
          finalTemperature: currentTemp,
        };
      }

      if (result.newTemperature !== undefined) {
        currentTemp = result.newTemperature;
        stepsCompleted++;
        
        console.log(`Step ${stepsCompleted}: ${currentTemp}°C`);
        
        // 短い待機時間を追加（API負荷軽減）
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        break; // 温度が変わらない場合は終了
      }
    }

    return {
      success: true,
      finalTemperature: currentTemp,
      stepsCompleted,
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stepsCompleted: 0,
    };
  }
}

/**
 * 開発・テスト用の設定
 */
export const PiApiConfig = {
  baseUrl: PI_API_BASE_URL,
  timeout: 10000,
  
  // モックモード（PI_API_URL が設定されていない場合にフォールバック）
  isMockMode: !process.env.NEXT_PUBLIC_PI_API_URL,
};