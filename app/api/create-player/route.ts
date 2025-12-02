// app/api/create-player/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { Player, GamePhase } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const trimmedName = name?.trim();

    if (!trimmedName || typeof trimmedName !== 'string' || trimmedName.length > 30) {
      return NextResponse.json({ message: 'Valid name is required' }, { status: 400 });
    }

    let playerId: string | null = null;
    let playerAlreadyExists = false;

    const updatedState = await updateGameState((currentState) => {
      const existingPlayer = Object.values(currentState.players).find(
        (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingPlayer) {
        playerId = existingPlayer.id;
        playerAlreadyExists = true;
        // If player exists, we don't need to modify the state.
        // We just return their ID.
        return currentState;
      }

      // If player does not exist, check if they can be added
      if (currentState.gamePhase !== GamePhase.WAITING_FOR_PLAYERS) {
        // Game has started, new players cannot join
        return currentState;
      }

      // Create new player
      const newPlayerId = randomUUID();
      playerId = newPlayerId;
      
      const newPlayer: Player = {
        id: newPlayerId,
        name: trimmedName,
        totalCoins: 0,
        income: 10,
        foodDebt: 0,
        eventDebt: 0,
        eventDebtLog: [],
        categoryTotals: { short: 0, long: 0, emergency: 0 },
        currentAllocation: null,
        coinsToAllocate: 0,
        actionRequired: null,
        allocationChanges: null,
        hasConfirmed: false,
        lastUpdate: Date.now(),
        foodCostWaived: false,
        lastRoundSummary: null,
      };

      currentState.players[newPlayerId] = newPlayer;
      return currentState;
    });

    if (playerAlreadyExists) {
      return NextResponse.json({ playerId, gameState: updatedState });
    }

    if (!playerId) {
        return NextResponse.json({ message: 'Game has already started. Cannot join.' }, { status: 403 });
    }

    return NextResponse.json({ playerId, gameState: updatedState });
  } catch (error) {
    console.error('Create Player Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
