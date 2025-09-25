import { NextRequest, NextResponse } from 'next/server';
import { executeTemperatureCommand, PiApiConfig } from '@/services/raspberryPiApi';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const body = await request.json();
  const { type, payload } = body;
  
  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Raspberry Pi API への実際のコマンド送信
  try {
    let result: { success: boolean; newTemperature?: number; error?: string };
    
    switch (type) {
      case 'set_temperature':
        // 温度設定: 現在温度との差分で up/down を判定
        const currentTemp = payload.current_temperature || 24;
        const targetTemp = payload.temperature_c || 24;
        
        if (targetTemp > currentTemp) {
          result = await executeTemperatureCommand(roomId, 'increase');
        } else if (targetTemp < currentTemp) {
          result = await executeTemperatureCommand(roomId, 'decrease');
        } else {
          result = { success: true, newTemperature: currentTemp };
        }
        break;
        
      case 'temperature_up':
        result = await executeTemperatureCommand(roomId, 'increase');
        break;
        
      case 'temperature_down':
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
            type,
            payload,
            error: `Unsupported command type: ${type}`,
            scheduled_at: new Date().toISOString(),
          }, { status: 400 });
        }
    }
    
    if (result.success) {
      return NextResponse.json({
        command_id: commandId,
        status: 'completed',
        type,
        payload: {
          ...payload,
          ...(result.newTemperature && { actual_temperature: result.newTemperature }),
        },
        scheduled_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        command_id: commandId,
        status: 'failed',
        type,
        payload,
        error: result.error,
        scheduled_at: new Date().toISOString(),
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Command execution failed:', error);
    
    // エラー時はフォールバック（モック応答）
    return NextResponse.json({
      command_id: commandId,
      status: 'failed',
      type,
      payload,
      error: error instanceof Error ? error.message : 'Unknown error',
      scheduled_at: new Date().toISOString(),
    }, { status: 500 });
  }
}
