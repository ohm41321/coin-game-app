// lib/types.ts

export interface Player {
  id: string;
  name: string;
  totalCoins: number;
  income: number;
  foodDebt: number;
  eventDebt: number;
  eventDebtLog: string[];
  categoryTotals: {
    food: number;
    short: number;
    long: number;
    emergency: number;
  };
  currentAllocation: PlayerAllocation | null;
  // New fields for event resolution
  actionRequired:
    | { type: 'DISTRIBUTE_LOSS'; value: number }
    | { type: 'COVER_SPECIFIC_LOSS'; value: number; targetCategory: 'short' | 'long' }
    | { type: 'ALLOCATE_BONUS'; value: number }
    | null;
  allocationChanges: { category: keyof PlayerAllocation; from: number; to: number }[] | null;
  
  hasConfirmed: boolean; // This will now mean "has resolved their action"
  lastUpdate: number;
  foodCostWaived: boolean;
  lastRoundSummary: string[] | null;
}

export interface GMState {
  isLoggedIn: boolean;
}

export enum GamePhase {
  WAITING_FOR_PLAYERS = 'WAITING_FOR_PLAYERS',
  ROUND_START = 'ROUND_START',
  ALLOCATION = 'ALLOCATION',
  EVENT_DRAWN = 'EVENT_DRAWN', // For automatic events, shows results
  EVENT_RESOLUTION = 'EVENT_RESOLUTION', // For choice events, waits for player input
  ROUND_CALCULATION = 'ROUND_CALCULATION',
  ROUND_END = 'ROUND_END',
  GAME_OVER = 'GAME_OVER',
}

// Union type for all possible event effects
export type EventEffect =
  | { type: 'COIN_CHANGE'; category: 'short' | 'long' | 'emergency' | 'total'; value: number; isPlayerChoice?: boolean; isCoverable?: boolean }
  | { type: 'RULE_CHANGE'; category: 'short' | 'long'; newRatio: number }
  | { type: 'INCOME_BOOST'; value: number }
  | { type: 'WAIVE_FOOD_COST' };

export interface EventCard {
  id: string;
  title: string;
  description: string;
  effect: EventEffect;
}

export interface GameState {
  gamePhase: GamePhase;
  currentRound: number;
  players: Record<string, Player>;
  gm: GMState;
  currentEvent: EventCard | null;
  lastModified: number; // Timestamp of the last state change
  leaderboard: { name: string; totalCoins: number }[];
}

// Type for the data submitted by the player
export type PlayerAllocation = {
  food: number;
  short: number;
  long: number;
  emergency: number;
};
