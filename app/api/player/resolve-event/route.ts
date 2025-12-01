// app/api/player/resolve-event/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase, PlayerAllocation } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const {
      playerId,
      lossDistribution,
    }: { playerId: string; lossDistribution: PlayerAllocation } = await request.json();

    if (!playerId || !lossDistribution) {
      return NextResponse.json({ message: 'Player ID and loss distribution are required' }, { status: 400 });
    }

    let errorMsg: string | null = null;

    const updatedState = await updateGameState((currentState) => {
      const player = currentState.players[playerId];
      const event = currentState.currentEvent;

      // Validation
      if (!player) { errorMsg = 'Player not found.'; return currentState; }
      if (!event) { errorMsg = 'No active event.'; return currentState; }
      if (currentState.gamePhase !== GamePhase.EVENT_RESOLUTION) { errorMsg = 'Not in the event resolution phase.'; return currentState; }
      if (player.actionRequired?.type !== 'DISTRIBUTE_LOSS') { errorMsg = 'No such action required for this player.'; return currentState; }

      const requiredLoss = player.actionRequired.value;
      
      // No longer check if distributedLoss === requiredLoss, as partial payment is allowed.
      // The debt will be calculated from any unpaid amount.

      if (lossDistribution.food > 0) {
        errorMsg = 'Cannot deduct coins from the Food/Housing category.';
        return currentState;
      }

      const newAllocation = { ...player.currentAllocation! };
      const changes = [];
      let totalPaid = 0;

      // Deduct what can be paid from the allocation
      for (const key in lossDistribution) {
        const category = key as keyof PlayerAllocation;
        const requestedLoss = lossDistribution[category];
        const availableToPay = newAllocation[category];
        
        const actualPayment = Math.min(requestedLoss, availableToPay);
        
        if (actualPayment > 0) {
            const from = newAllocation[category];
            const to = from - actualPayment;
            newAllocation[category] = to;
            changes.push({ category, from, to });
            totalPaid += actualPayment;
        }
      }
      
      const debt = requiredLoss - totalPaid;
      if (debt > 0) {
        player.eventDebt += debt;
        player.eventDebtLog.push(`Incurred ${debt} debt from "${event.title}"`);
      }

      // All checks passed, update the player state
      player.currentAllocation = newAllocation;
      player.allocationChanges = changes;
      player.actionRequired = null;
      player.hasConfirmed = true;

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
    console.error('Resolve Event Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
