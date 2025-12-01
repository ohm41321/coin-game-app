// app/api/player/allocate-bonus/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase } from '@/lib/types';

interface BonusAllocationPayload {
    playerId: string;
    bonusAllocation: {
        short: number;
        long: number;
        emergency: number;
    }
}

export async function POST(request: Request) {
  try {
    const { playerId, bonusAllocation }: BonusAllocationPayload = await request.json();

    if (!playerId || !bonusAllocation) {
      return NextResponse.json({ message: 'Player ID and bonus allocation are required' }, { status: 400 });
    }

    const { short, long, emergency } = bonusAllocation;
    let errorMsg: string | null = null;

    const updatedState = await updateGameState((currentState) => {
      const player = currentState.players[playerId];

      // Validation
      if (!player) {
        errorMsg = 'Player not found.';
        return currentState;
      }
      if (currentState.gamePhase !== GamePhase.EVENT_RESOLUTION) {
        errorMsg = 'Not in the event resolution phase.';
        return currentState;
      }
      if (player.actionRequired?.type !== 'ALLOCATE_BONUS') {
        errorMsg = 'No such action required for this player.';
        return currentState;
      }

      const requiredBonus = player.actionRequired.value;
      const distributedBonus = short + long + emergency;

      if (distributedBonus !== requiredBonus) {
        errorMsg = `You must allocate exactly ${requiredBonus} coins.`;
        return currentState;
      }

      // All checks passed, update player state
      player.categoryTotals.short += short;
      player.categoryTotals.long += long;
      player.categoryTotals.emergency += emergency;
      player.totalCoins += distributedBonus;
      
      player.actionRequired = null;
      player.hasConfirmed = true;

      // Check if all players have now confirmed
      const allPlayersConfirmed = Object.values(currentState.players).every(p => p.hasConfirmed || p.actionRequired === null);
      if (allPlayersConfirmed) {
        currentState.gamePhase = GamePhase.EVENT_DRAWN;
      }
      
      return currentState;
    });

    if (errorMsg) {
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Allocate Bonus Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
