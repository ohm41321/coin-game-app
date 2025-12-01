// app/api/player/acknowledge-summary/route.ts
import { NextResponse } from 'next/server';
import { updateGameState, getGameState } from '@/lib/gameState';

export async function POST(request: Request) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ message: 'Player ID is required' }, { status: 400 });
    }

    const currentState = await getGameState();

    // In a real app, you'd want auth to make sure the player is who they say they are.
    if (!currentState.players[playerId]) {
        return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }

    await updateGameState((gameState) => {
      if (gameState.players[playerId]) {
        gameState.players[playerId].lastRoundSummary = null;
      }
      return gameState;
    });

    return NextResponse.json({ message: 'Summary acknowledged' });
  } catch (error) {
    console.error('Acknowledge Summary Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
