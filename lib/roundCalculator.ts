// lib/roundCalculator.ts
import { GameState, Player, PlayerAllocation, EventCard, GamePhase, RoundSummaryItem } from './types';

const FOOD_HOUSING_COST = 5;
const BASE_SHORT_TERM_INVESTMENT_RATIO = 3;
const BASE_LONG_TERM_INVESTMENT_RATIO = 4;
const LONG_TERM_BONUS_RATIO = 2;
export const MAX_ROUNDS = 5;

export function finalizeGame(gameState: GameState): GameState {
    // --- FINAL GAME OVER CALCULATION ---
    gameState.gamePhase = GamePhase.GAME_OVER;
    
    // Calculate final scores
    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];

        // First, add all category totals back to the player's main coin total
        const totalFromCategories = 
            player.categoryTotals.short + 
            player.categoryTotals.long + 
            player.categoryTotals.emergency;
        
        player.totalCoins += totalFromCategories;

        // Then, apply the end-of-game bonus for long-term investments
        const bonus = Math.floor(player.categoryTotals.long / LONG_TERM_BONUS_RATIO);
        player.totalCoins += bonus;
    }

    // Create leaderboard
    gameState.leaderboard = Object.values(gameState.players)
        .map(p => ({ name: p.name, totalCoins: Math.floor(p.totalCoins) }))
        .sort((a, b) => b.totalCoins - a.totalCoins)
        .slice(0, 10); // Show Top 10

    return gameState;
}


export function calculateRound(gameState: GameState): GameState {
    const { currentEvent } = gameState;

    // Step 1: Determine the rules for this round based on events
    let shortTermRatio = BASE_SHORT_TERM_INVESTMENT_RATIO;
    let longTermRatio = BASE_LONG_TERM_INVESTMENT_RATIO;

    if (currentEvent?.effect.type === 'RULE_CHANGE') {
        if (currentEvent.effect.category === 'short') {
            shortTermRatio = currentEvent.effect.newRatio;
        }
        if (currentEvent.effect.category === 'long') {
            longTermRatio = currentEvent.effect.newRatio;
        }
    }

    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        const summary: RoundSummaryItem[] = [];
        player.lastRoundSummary = null; // Clear previous summary

        const { currentAllocation } = player;

        // At the start of the calculation, "pay" the debt from the previous round
        // by noting it and then clearing the field for the current round.
        const debtToPay = player.eventDebt;
        if (debtToPay > 0) {
            summary.push({ key: 'summary.paidDebt', vars: { amount: debtToPay } });
        }
        player.eventDebt = 0;
        player.eventDebtLog = [];

        if (!currentAllocation) continue; // Skip players who didn't submit

        // Step 2: Apply direct coin changes from events BEFORE calculation
        if (currentEvent?.effect.type === 'COIN_CHANGE' && currentEvent.effect.value < 0) {
            // Negative changes are applied immediately
            const { category, value } = currentEvent.effect;
            summary.push({ key: 'summary.lostCoinsFromEvent', vars: { amount: Math.abs(value), event: currentEvent.title.en } });
            if (category === 'total') {
                player.totalCoins += value;
            } else {
                player.categoryTotals[category] = Math.max(0, player.categoryTotals[category] + value);
            }
        }
        
        let availableCoins = player.totalCoins;

        // Step 4: Handle payments and food balance
        const currentRoundFoodCost = player.foodCostWaived ? 0 : FOOD_HOUSING_COST;
        player.foodCostWaived = false; // Reset flag after use
        
        const foodBalanceBeforePayment = player.foodDebt + currentRoundFoodCost;
        if (currentRoundFoodCost > 0) {
            summary.push({ key: 'summary.foodHousingCost', vars: { amount: currentRoundFoodCost } });
        } else {
            summary.push({ key: 'summary.foodHousingWaived' });
        }


        // Player pays what they allocated, up to what they can afford.
        const foodPayment = Math.min(currentAllocation.food, availableCoins);
        availableCoins -= foodPayment;

        // Subtract payment from the balance. The result can be positive (debt) or negative (credit).
        player.foodDebt = foodBalanceBeforePayment - foodPayment;

        if (foodPayment > 0) {
            summary.push({ key: 'summary.paidFoodHousing', vars: { amount: foodPayment } });
        }
        if (player.foodDebt > 0) {
            summary.push({ key: 'summary.foodDebtRemaining', vars: { amount: player.foodDebt } });
        } else if (player.foodDebt < 0) {
            summary.push({ key: 'summary.foodCredit', vars: { amount: -player.foodDebt } });
        }
        
        const shortTermPayment = Math.min(currentAllocation.short, availableCoins);
        availableCoins -= shortTermPayment;
        player.categoryTotals.short += shortTermPayment;

        const longTermPayment = Math.min(currentAllocation.long, availableCoins);
        availableCoins -= longTermPayment;
        player.categoryTotals.long += longTermPayment;

        const emergencyContribution = Math.min(currentAllocation.emergency, availableCoins);
        availableCoins -= emergencyContribution;
        player.categoryTotals.emergency += emergencyContribution;
        
        // The remaining availableCoins is the new total
        player.totalCoins = availableCoins;

        summary.push({ key: 'summary.addedToCategories', vars: { short: shortTermPayment, long: longTermPayment, emergency: emergencyContribution } });
        summary.push({ key: 'summary.liquidCoinsRemaining', vars: { amount: player.totalCoins } });

        // Step 5: Calculate income for next round, penalized by total food debt and event debt from the previous round
        const incomeFromShort = Math.floor(player.categoryTotals.short / shortTermRatio);
        const incomeFromLong = Math.floor(player.categoryTotals.long / longTermRatio);
        let incomeBoost = 0;
        if (currentEvent?.effect.type === 'INCOME_BOOST') {
            incomeBoost = currentEvent.effect.value;
            summary.push({ key: 'summary.incomeBoost', vars: { amount: incomeBoost, event: currentEvent.title.en } });
        }
        // The penalty is the total outstanding food debt plus the event debt we are "paying" this turn
        player.income = 10 + incomeFromShort + incomeFromLong + incomeBoost - player.foodDebt - debtToPay;
        
        summary.push({ key: 'summary.baseIncome', vars: { amount: 10 } });
        summary.push({ key: 'summary.incomeFromShort', vars: { amount: incomeFromShort } });
        summary.push({ key: 'summary.incomeFromLong', vars: { amount: incomeFromLong } });
        if (player.foodDebt > 0) summary.push({ key: 'summary.penaltyFoodDebt', vars: { amount: player.foodDebt } });
        if (debtToPay > 0) summary.push({ key: 'summary.penaltyEventDebt', vars: { amount: debtToPay } });
        summary.push({ key: 'summary.totalIncomeNextRound', vars: { amount: player.income } });

        player.lastRoundSummary = summary;

        // Step 6: Handle effects that apply to the NEXT round
        if (currentEvent?.effect.type === 'WAIVE_FOOD_COST') {
            player.foodCostWaived = true;
        }
    }
    
    // Step 8: Transition Game Phase
    if (gameState.currentRound >= MAX_ROUNDS) {
        return finalizeGame(gameState);
    } else {
        gameState.gamePhase = GamePhase.ROUND_END;
    }

    return gameState;
}
