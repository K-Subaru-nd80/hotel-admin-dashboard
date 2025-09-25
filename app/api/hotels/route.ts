import { NextResponse } from 'next/server';
import { mockHotels } from '@/mocks/data';

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return NextResponse.json(mockHotels);
}
