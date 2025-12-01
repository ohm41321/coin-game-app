// app/api/gm/draw-event/route.ts
import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/gameState';
import { GamePhase, PlayerAllocation } from '@/lib/types';
import { drawEventCard } from '@/lib/gameLogic';

export async function POST() {
  try {
    let eventDrawn = false;
    const updatedState = await updateGameState((currentState) => {
      // Auth and phase check
      if (!currentState.gm.isLoggedIn || currentState.gamePhase !== GamePhase.ALLOCATION) {
        return currentState;
      }
      
      const allPlayersSubmitted = Object.values(currentState.players).every(p => p.currentAllocation !== null);
      if (!allPlayersSubmitted) {
        return currentState; // Not everyone is ready
      }

      eventDrawn = true;
      const event = drawEventCard();
      currentState.currentEvent = event;

      // Reset confirmations and changes for all players
      for (const playerId in currentState.players) {
        currentState.players[playerId].hasConfirmed = false;
        currentState.players[playerId].allocationChanges = null;
        currentState.players[playerId].actionRequired = null;
      }

      // Check if the event requires player choice
      if (event.effect.type === 'COIN_CHANGE' && event.effect.isPlayerChoice) {
        currentState.gamePhase = GamePhase.EVENT_RESOLUTION;
        for (const playerId in currentState.players) {
          currentState.players[playerId].actionRequired = {
            type: 'DISTRIBUTE_LOSS',
            value: Math.abs(event.effect.value),
          };
        }
      } else if (event.effect.type === 'COIN_CHANGE' && event.effect.isCoverable) {
        currentState.gamePhase = GamePhase.EVENT_RESOLUTION;
        const { value, category } = event.effect;
        if (category !== 'total' && category !== 'emergency') { // Sanity check
            for (const playerId in currentState.players) {
                currentState.players[playerId].actionRequired = {
                    type: 'COVER_SPECIFIC_LOSS',
                    value: Math.abs(value),
                    targetCategory: category,
                };
            }
        }
      } else if (event.effect.type === 'COIN_CHANGE' && event.effect.value > 0) {
        currentState.gamePhase = GamePhase.EVENT_RESOLUTION;
        for (const playerId in currentState.players) {
          currentState.players[playerId].actionRequired = {
            type: 'ALLOCATE_BONUS',
            value: event.effect.value,
          };
        }
      } else {
        // It's an automatic event, calculate the effects now
        currentState.gamePhase = GamePhase.EVENT_DRAWN;
        if (event.effect.type === 'COIN_CHANGE') {
          const { category, value } = event.effect;
          if (category !== 'total') {
            for (const playerId in currentState.players) {
              const player = currentState.players[playerId];
              if (player.currentAllocation) {
                const from = player.currentAllocation[category];
                const to = Math.max(0, from + value);
                if (from !== to) {
                  player.allocationChanges = [{ category, from, to }];
                  player.currentAllocation[category] = to; // Update backend state
                }
              }
            }
          }
        }
        // RULE_CHANGE, INCOME_BOOST, etc., don't have immediate allocation effects,
        // so they are just displayed. The calculator will handle their logic.
      }

      return currentState;
    });

    if (!updatedState.gm.isLoggedIn) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    if (!eventDrawn) {
        return NextResponse.json({ message: 'Cannot draw event yet. Not all players have submitted their allocation.' }, { status: 409 });
    }

    return NextResponse.json(updatedState);
  } catch (error) {
    console.error('Draw Event Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
