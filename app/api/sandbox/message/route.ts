import { NextRequest, NextResponse } from 'next/server';

// TODO: integrate with sandbox to process messages

export async function POST(request: NextRequest) {
  const { sandboxId, message } = await request.json();
  return NextResponse.json({ sandboxId, reply: `Echo: ${message}` });
}
