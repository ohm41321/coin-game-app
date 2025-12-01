// app/api/gm/start-round/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase } from '@/lib/types';

export async function POST() {
  try {
    const updatedState = await updateGameState((currentState) => {
      // Security check: Only allow if GM is logged in
      if (!currentState.gm.isLoggedIn) {
        // Since we can't throw an error here, we just return the unchanged state.
        // The frontend should prevent this, but it's a safeguard.
        // A proper implementation would have session management to protect routes.
        return currentState;
      }

      // Allow starting if waiting for players or after a round has ended
      const canStart =
        currentState.gamePhase === GamePhase.WAITING_FOR_PLAYERS ||
        currentState.gamePhase === GamePhase.ROUND_END;

      if (!canStart) {
        return currentState;
      }

      // --- Start New Round ---
      currentState.currentRound += 1;
      currentState.gamePhase = GamePhase.ALLOCATION;
      currentState.currentEvent = null; // Clear previous event

      // Update each player for the new round
      for (const playerId in currentState.players) {
        const player = currentState.players[playerId];

        // Add income to total coins
        player.totalCoins += player.income;
        // Set the allocation budget for this round
        player.coinsToAllocate = player.income;
        
        // Reset round-specific fields
        player.currentAllocation = null;
        player.actionRequired = null;
        player.allocationChanges = null;
        player.hasConfirmed = false;
        player.lastUpdate = Date.now();
      }

      return currentState;
    });

    // Check if the state was actually changed
    if (!updatedState.gm.isLoggedIn) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Start Round Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
