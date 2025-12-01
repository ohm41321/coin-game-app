// app/api/player/submit-allocation/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase, PlayerAllocation } from '@/lib/types';

const COINS_PER_ROUND = 10;

export async function POST(request: Request) {
  try {
    const {
      playerId,
      allocation,
    }: { playerId: string; allocation: PlayerAllocation } = await request.json();

    if (!playerId || !allocation) {
      return NextResponse.json(
        { message: 'Player ID and allocation are required' },
        { status: 400 }
      );
    }

    const { food, short, long, emergency } = allocation;
    const allValuesPresent = [food, short, long, emergency].every(
      (v) => typeof v === 'number' && v >= 0
    );

    if (!allValuesPresent) {
      return NextResponse.json(
        { message: 'Invalid allocation values' },
        { status: 400 }
      );
    }

    const totalAllocation = food + short + long + emergency;
    let validationError: string | null = null;

    const updatedState = await updateGameState((currentState) => {
      const player = currentState.players[playerId];
      
      if (!player || currentState.gamePhase !== GamePhase.ALLOCATION) {
        // Return without setting error, as this could be a normal race condition
        return currentState;
      }

      const expectedTotal = player.coinsToAllocate;
      if (totalAllocation !== expectedTotal) {
        validationError = `Allocation must sum to ${expectedTotal}`;
        return currentState;
      }

      player.currentAllocation = allocation;
      player.hasConfirmed = true; 
      player.lastUpdate = Date.now();

      return currentState;
    });

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    if (!updatedState.players[playerId]) {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }
    
    // Final check to ensure state wasn't changed by another process
    if (updatedState.gamePhase !== GamePhase.ALLOCATION) {
        // This is a soft-fail, the UI will just update. No error needed.
        return NextResponse.json(updatedState);
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Submit Allocation Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}