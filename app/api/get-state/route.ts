// app/api/get-state/route.ts
import { NextResponse } from 'next/server';
import { getGameState, getInitialState } from '@/lib/gameState';

// Force dynamic execution and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  // IMPORTANT: If we are in a build environment, don't touch the file system.
  // Return a default state immediately. This prevents build timeouts.
  if (process.env.NEXT_BUILD) {
    return NextResponse.json(getInitialState());
  }

  try {
    const gameState = await getGameState();
    return NextResponse.json(gameState);
  } catch (error) {
    console.error('Get State Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
