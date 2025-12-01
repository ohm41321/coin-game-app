// app/api/gm/end-round/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase } from '@/lib/types';
import { calculateRound } from '@/lib/roundCalculator';

export async function POST() {
  try {
    let roundEnded = false;
    const updatedState = await updateGameState((currentState) => {
      // Auth and phase check
      if (
        !currentState.gm.isLoggedIn ||
        currentState.gamePhase !== GamePhase.EVENT_DRAWN
      ) {
        return currentState;
      }

      roundEnded = true;
      // All checks passed, calculate the results for the round
      return calculateRound(currentState);
    });

    if (!updatedState.gm.isLoggedIn) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!roundEnded) {
      return NextResponse.json({ message: 'Cannot end round yet. Not all players have confirmed.' }, { status: 409 });
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('End Round Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
