// app/api/player/cover-loss/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase } from '@/lib/types';

interface LossCoveragePayload {
    playerId: string;
    lossCoverage: {
        fromTarget: number;
        fromEmergency: number;
        targetCategory: 'short' | 'long';
    }
}

export async function POST(request: Request) {
  try {
    const { playerId, lossCoverage }: LossCoveragePayload = await request.json();

    if (!playerId || !lossCoverage) {
      return NextResponse.json({ message: 'Player ID and loss coverage are required' }, { status: 400 });
    }

    const { fromTarget, fromEmergency, targetCategory } = lossCoverage;
    let errorMsg: string | null = null;

    const updatedState = await updateGameState((currentState) => {
      const player = currentState.players[playerId];
      const event = currentState.currentEvent;

      // Validation
      if (!player) { errorMsg = 'Player not found.'; return currentState; }
      if (!event) { errorMsg = 'No active event.'; return currentState; }
      if (currentState.gamePhase !== GamePhase.EVENT_RESOLUTION) { errorMsg = 'Not in the event resolution phase.'; return currentState; }
      if (player.actionRequired?.type !== 'COVER_SPECIFIC_LOSS' || player.actionRequired?.targetCategory !== targetCategory) {
        errorMsg = 'No such action required for this player.';
        return currentState;
      }

      const requiredLoss = player.actionRequired.value;

      // No longer check if fromTarget + fromEmergency === requiredLoss, as partial payment is allowed.
      // The debt will be calculated from any unpaid amount.
      
      // Determine what can actually be paid
      const payableFromTarget = Math.min(fromTarget, player.categoryTotals[targetCategory]);
      const payableFromEmergency = Math.min(fromEmergency, player.categoryTotals.emergency);
      const totalPaid = payableFromTarget + payableFromEmergency;
      const debt = requiredLoss - totalPaid;

      // All checks passed, update player state
      player.categoryTotals[targetCategory] -= payableFromTarget;
      player.categoryTotals.emergency -= payableFromEmergency;
      
      if (debt > 0) {
        player.eventDebt += debt;
        player.eventDebtLog.push(`Incurred ${debt} debt from "${event.title.en}"`);
      }

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
    console.error('Cover Loss Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
