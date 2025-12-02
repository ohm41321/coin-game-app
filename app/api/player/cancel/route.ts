// app/api/player/cancel/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ message: 'Player ID is required' }, { status: 400 });
    }

    const updatedState = await updateGameState((currentState) => {
      // Only allow cancellation if the game is in the waiting phase
      if (currentState.gamePhase !== GamePhase.WAITING_FOR_PLAYERS) {
        return currentState;
      }

      if (currentState.players[playerId]) {
        delete currentState.players[playerId];
      }
      
      return currentState;
    });

    return NextResponse.json({ success: true, gameState: updatedState });
  } catch (error) {
    console.error('Cancel Player Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
