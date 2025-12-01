// app/api/gm/reset/route.ts
import { NextResponse } from 'next/server';
import { resetGameState, getGameState } from '@/lib/gameState';

export async function POST(request: Request) {
  try {
    // In a real app, you'd want to be absolutely sure this is a logged-in GM.
    // We'll rely on the GM's password-protected client for this.
    const currentState = await getGameState();
    if (!currentState.gm.isLoggedIn) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updatedState = await resetGameState();

    return NextResponse.json({ message: 'Game has been reset', gameState: updatedState });
  } catch (error) {
    console.error('Reset Game Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
