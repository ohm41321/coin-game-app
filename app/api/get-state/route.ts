// app/api/get-state/route.ts
import { NextResponse } from 'next/server';
import { getGameState } from '@/lib/gameState';

// Force dynamic execution and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const gameState = await getGameState();
    return NextResponse.json(gameState);
  } catch (error) {
    console.error('Get State Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
