// lib/gameLogic.ts

import { EventCard } from './types';

/**
 * A pool of possible event cards.
 */
export const EVENT_CARDS: EventCard[] = [
  {
    id: 'event-01',
    title: 'ไฟไหม้ (Fire!)',
    description: 'เลือกเสีย 5 เหรียญ จากช่องอะไรก็ได้ (You must lose 5 coins). Please choose which categories to deduct from.',
    effect: { type: 'COIN_CHANGE', category: 'total', value: -5, isPlayerChoice: true },
  },
  {
    id: 'event-02',
    title: 'ธนาคารปรับลดอัตราดอกเบี้ย (Interest Rate Change)',
    description: 'ในตานี้, กฏเงินฝากระยะสั้นเปลี่ยนเป็น: ทุกๆ 4 เหรียญ จะได้รายได้เพิ่ม 1 เหรียญ (Short-term investment rule change for this round: every 4 coins = +1 income).',
    effect: { type: 'RULE_CHANGE', category: 'short', newRatio: 4 },
  },
  {
    id: 'event-03',
    title: 'บริษัทปรับลดเงินปันผล (Dividend Cut)',
    description: 'ในตานี้, กฏเงินฝากระยะยาวเปลี่ยนเป็น: ทุกๆ 5 เหรียญ จะได้รายได้เพิ่ม 1 เหรียญ (Long-term investment rule change for this round: every 5 coins = +1 income).',
    effect: { type: 'RULE_CHANGE', category: 'long', newRatio: 5 },
  },
    {
    id: 'event-04',
    title: 'เจอกระเป๋าตังตก (Found a Wallet)',
    description: 'คุณได้รับเงินตอบแทน 3 เหรียญ (You receive a reward of 3 coins).',
    effect: { type: 'COIN_CHANGE', category: 'total', value: 3 },
  },
  {
    id: 'event-05',
    title: 'โดนสแกมเมอร์หลอก (Scammed!)',
    description: 'เสียเงินฝากระยะสั้น 3 เหรียญ (Lose 3 coins from short-term). You can use your Emergency Fund to cover this loss.',
    effect: { type: 'COIN_CHANGE', category: 'short', value: -3, isCoverable: true },
  },
  {
    id: 'event-06',
    title: 'เงินเฟ้อ (Inflation)',
    description: 'เสียเงินฝากระยะยาว 2 เหรียญ (Lose 2 coins from long-term). You can use your Emergency Fund to cover this loss.',
    effect: { type: 'COIN_CHANGE', category: 'long', value: -2, isCoverable: true },
  },
  {
    id: 'event-07',
    title: 'เพื่อนเลี้ยงข้าว (Friend Buys Lunch)',
    description: 'ได้รับเงินค่าอาหาร/ที่อยู่ 3 เหรียญ (Receive 3 coins for food/housing). Added to total.',
    effect: { type: 'COIN_CHANGE', category: 'total', value: 3 },
  },
  {
    id: 'event-08',
    title: 'ได้รับมรดก (Inheritance)',
    description: 'รายได้รับเหรียญ 10 เหรียญ (Your income for the next round is boosted by 10 coins).',
    effect: { type: 'INCOME_BOOST', value: 10 },
  },
  {
    id: 'event-09',
    title: 'เพื่อนคืนเงิน (Friend Pays You Back)',
    description: 'ได้รับเงิน 2 เหรียญ (Receive 2 coins).',
    effect: { type: 'COIN_CHANGE', category: 'total', value: 2 },
  },
  {
    id: 'event-10',
    title: 'ได้ข้าวกินฟรีปีนึง (Free Food for a Year!)',
    description: 'ในรอบหน้าจะได้รับการยกเว้นค่าอาหาร/ที่อยู่ (Your food/housing cost is waived for the next round).',
    effect: { type: 'WAIVE_FOOD_COST' },
  },
];

/**
 * Selects a random event card from the pool.
 */
export function drawEventCard(): EventCard {
  const randomIndex = Math.floor(Math.random() * EVENT_CARDS.length);
  return EVENT_CARDS[randomIndex];
}
