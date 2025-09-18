import { NextRequest, NextResponse } from 'next/server';
import { generateMockRooms } from '@/mocks/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { hotelId: string } }
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const rooms = generateMockRooms(params.hotelId, 50);
  
  return NextResponse.json(rooms);
}
