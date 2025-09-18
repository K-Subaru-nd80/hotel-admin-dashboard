import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest
) {
  const body = await request.json();
  const { type, payload } = body;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return NextResponse.json({
    command_id: commandId,
    status: 'pending',
    type,
    payload,
    scheduled_at: new Date().toISOString(),
  });
}
