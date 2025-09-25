import { NextRequest, NextResponse } from 'next/server';
import { generateMockRooms } from '@/mocks/data';
import { getRoomData, PiApiConfig } from '@/services/raspberryPiApi';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  const { hotelId } = await params;
  try {
    // Raspberry Pi API が利用可能な場合は実データを取得
    if (!PiApiConfig.isMockMode) {
      // 現在の Pi API は1部屋分の情報のみ取得可能
      // 複数部屋をサポートする場合は、複数の Pi デバイスか、
      // または Pi API の拡張が必要
      const roomId = `room_${hotelId}_101`; // とりあえず101号室
      const realRoomData = await getRoomData(roomId);
      
      // 単一部屋データを配列として返却
      return NextResponse.json([realRoomData]);
    }
    
    // モックモードまたは Pi API エラー時のフォールバック
    await new Promise(resolve => setTimeout(resolve, 300));
    const rooms = generateMockRooms(hotelId, 50);
    
    return NextResponse.json(rooms);
    
  } catch (error) {
    console.error('Failed to fetch room data from Pi API:', error);
    
    // エラー時はモックデータにフォールバック
    await new Promise(resolve => setTimeout(resolve, 300));
    const rooms = generateMockRooms(hotelId, 50);
    
    return NextResponse.json(rooms);
  }
}
