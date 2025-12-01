// app/api/gm/end-game-early/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { finalizeGame } from '@/lib/roundCalculator';

export async function POST() {
  try {
    const updatedState = await updateGameState((currentState) => {
      // Auth check
      if (!currentState.gm.isLoggedIn) {
        return currentState;
      }
      // Finalize the game state
      return finalizeGame(currentState);
    });

    if (!updatedState.gm.isLoggedIn) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('End Game Early Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
