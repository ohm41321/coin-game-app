// app/api/gm/force-end-round/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase, Player } from '@/lib/types';
import { calculateRound } from '@/lib/roundCalculator';

export async function POST() {
  try {
    const updatedState = await updateGameState((currentState) => {
      // Auth and phase check
      if (
        !currentState.gm.isLoggedIn ||
        currentState.gamePhase !== GamePhase.EVENT_RESOLUTION
      ) {
        return currentState;
      }

      // Handle unresolved actions for players by applying a default behavior
      for (const playerId in currentState.players) {
        const player = currentState.players[playerId];
        if (player.actionRequired) {
          switch (player.actionRequired.type) {
            case 'DISTRIBUTE_LOSS':
              // Default action: deduct from totalCoins. This is a direct penalty.
              player.totalCoins -= player.actionRequired.value;
              break;
            case 'COVER_SPECIFIC_LOSS':
              // Default action: The player fails to cover the loss, so it's applied to the category.
              // The roundCalculator will see the reduced amount in the category.
              if (player.currentAllocation) {
                const category = player.actionRequired.targetCategory;
                player.currentAllocation[category] = Math.max(
                  0,
                  player.currentAllocation[category] - player.actionRequired.value
                );
              }
              break;
            case 'ALLOCATE_BONUS':
              // Default action: The player doesn't act, so they forfeit the bonus.
              // No change to their state is needed.
              break;
          }
          // Clear the action flag so the game can proceed
          player.actionRequired = null;
        }
      }

      // All checks passed, calculate the results for the round
      return calculateRound(currentState);
    });

    if (!updatedState.gm.isLoggedIn) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Force End Round Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
