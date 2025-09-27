import { NextRequest, NextResponse } from 'next/server';
import { executeTemperatureCommand, setTargetTemperature, PiApiConfig } from '@/services/raspberryPiApi';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const body = await request.json();
  const { type, payload, action, temperature } = body;
  
  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Raspberry Pi API への実際のコマンド送信
  try {
    let result: { success: boolean; newTemperature?: number; error?: string };
    
    // 新しいactionベース、旧typeベース両方に対応
    const commandType = action || type;
    const targetTemp = temperature || payload?.temperature_c;
    
    switch (commandType) {
      case 'set_temperature':
      case 'set':
        // 目標温度設定: 段階的に調整
        const targetTempValue = targetTemp || 24;
        const targetResult = await setTargetTemperature(roomId, targetTempValue);
        
        result = {
          success: targetResult.success,
          newTemperature: targetResult.finalTemperature,
          error: targetResult.error,
        };
        break;
        
      case 'temperature_up':
      case 'increase':
        result = await executeTemperatureCommand(roomId, 'increase');
        break;
        
      case 'temperature_down':
      case 'decrease':
        result = await executeTemperatureCommand(roomId, 'decrease');
        break;
        
        default:
        // 未対応のコマンドタイプの場合はモック応答
        if (PiApiConfig.isMockMode) {
          await new Promise(resolve => setTimeout(resolve, 100));
          result = { success: true };
        } else {
          return NextResponse.json({
            command_id: commandId,
            status: 'failed',
            type: commandType,
            payload: payload || { action, temperature },
            error: `Unsupported command type: ${commandType}`,
            scheduled_at: new Date().toISOString(),
          }, { status: 400 });
        }
    }    if (result.success) {
      return NextResponse.json({
        command_id: commandId,
        status: 'completed',
        type: commandType,
        payload: {
          ...(payload || {}),
          action,
          temperature,
          ...(result.newTemperature && { actual_temperature: result.newTemperature }),
        },
        scheduled_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        command_id: commandId,
        status: 'failed',
        type: commandType,
        payload: payload || { action, temperature },
        error: result.error,
        scheduled_at: new Date().toISOString(),
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Command execution failed:', error);
    
    // 新しいactionベース、旧typeベース両方に対応（エラー時）
    const commandType = action || type;
    
    // エラー時はフォールバック（モック応答）
    return NextResponse.json({
      command_id: commandId,
      status: 'failed',
      type: commandType,
      payload: payload || { action, temperature },
      error: error instanceof Error ? error.message : 'Unknown error',
      scheduled_at: new Date().toISOString(),
    }, { status: 500 });
  }
}
