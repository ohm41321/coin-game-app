// lib/gameState.ts
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import lockfile from 'proper-lockfile';
import { GameState, GamePhase } from './types';
import { createHash } from 'crypto';

// Use the temporary directory for state, which is supported by Vercel/Netlify
const stateFilePath = path.join(os.tmpdir(), 'coin-game-state.json');
const lockPath = path.join(os.tmpdir(), 'coin-game-state.json.lock');

// Hash the GM password for security. In a real app, use a salted hash.
const GM_PASSWORD = process.env.GM_PASSWORD || 'password123';
const GM_PASSWORD_HASH = createHash('sha256').update(GM_PASSWORD).digest('hex');

/**
 * The initial state of the game.
 */
const getInitialState = (): GameState => ({
  gamePhase: GamePhase.WAITING_FOR_PLAYERS,
  currentRound: 0,
  players: {},
  gm: {
    isLoggedIn: false,
  },
  currentEvent: null,
  lastModified: Date.now(),
  leaderboard: [],
});

/**
 * Reads the current game state from the file.
 * If the file doesn't exist, it initializes and returns the default state.
 */
export async function getGameState(): Promise<GameState> {
  try {
    await fs.access(stateFilePath);
    const fileContent = await fs.readFile(stateFilePath, 'utf-8');
    const state: GameState = JSON.parse(fileContent);

    // --- Data Migration ---
    // This ensures that games saved with an older data structure are gracefully updated.
    for (const playerId in state.players) {
        const player = state.players[playerId];
        if (!player.categoryTotals) {
            // If categoryTotals doesn't exist at all, create it without food
            player.categoryTotals = { short: 0, long: 0, emergency: 0 };
        } else if ('food' in player.categoryTotals) {
            // If it does exist and has a food property, delete it
            delete (player.categoryTotals as any).food;
        }
    }

    return state;
  } catch (error) {
    // File doesn't exist or is corrupted, initialize it
    const initialState = getInitialState();
    await fs.writeFile(stateFilePath, JSON.stringify(initialState, null, 2));
    return initialState;
  }
}

/**
 * A robust function to atomically update the game state.
 * It uses a lock file to prevent race conditions from concurrent serverless function executions.
 * @param updater A function that receives the current state and returns the new state.
 */
export async function updateGameState(
  updater: (currentState: GameState) => GameState
): Promise<GameState> {
  // Ensure the lock directory exists
  await fs.mkdir(path.dirname(lockPath), { recursive: true });

  let release;
  try {
    // Acquire a lock with retry logic
    release = await lockfile.lock(stateFilePath, {
      retries: {
        retries: 5,
        factor: 3,
        minTimeout: 150,
        maxTimeout: 250,
      },
      lockfilePath: lockPath,
    });

    // Read the latest state
    const currentState = await getGameState();

    // Get the updated state from the updater function
    const newState = updater(currentState);

    // Add a timestamp for the last modification
    newState.lastModified = Date.now();

    // Write the new state back to the file
    await fs.writeFile(stateFilePath, JSON.stringify(newState, null, 2));

    return newState;
  } finally {
    // Always release the lock
    if (release) {
      await release();
    }
  }
}

/**
 * Helper function to get the GM password hash.
 */
export function getGMPasswordHash(): string {
  return GM_PASSWORD_HASH;
}

/**
 * Resets the game state to its initial values.
 * Primarily for testing or GM control.
 */
export async function resetGameState(): Promise<GameState> {
  return await updateGameState(() => getInitialState());
}
