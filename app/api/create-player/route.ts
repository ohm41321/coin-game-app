// app/api/create-player/route.ts
import { NextResponse } from 'next/server';
import { updateGameState, getGameState } from '@/lib/gameState';
import { Player, GamePhase } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.length > 30) {
      return NextResponse.json({ message: 'Valid name is required' }, { status: 400 });
    }

    // Ensure game is in the correct phase to accept new players
    const currentState = await getGameState();
    if (currentState.gamePhase !== GamePhase.WAITING_FOR_PLAYERS) {
      return NextResponse.json({ message: 'Game has already started' }, { status: 403 });
    }

    const playerId = randomUUID();
    const newPlayer: Player = {
      id: playerId,
      name: name.trim(),
      totalCoins: 0, // Players start with 0 coins until the first round begins
      income: 10, // Base income for the first round
      foodDebt: 0,
      eventDebt: 0,
      eventDebtLog: [],
      categoryTotals: { short: 0, long: 0, emergency: 0 },
      currentAllocation: null,
      actionRequired: null,
      allocationChanges: null,
      hasConfirmed: false,
      lastUpdate: Date.now(),
      foodCostWaived: false,
    };

    const updatedState = await updateGameState((currentState) => {
      currentState.players[playerId] = newPlayer;
      return currentState;
    });

    return NextResponse.json({ playerId, gameState: updatedState });
  } catch (error) {
    console.error('Create Player Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
