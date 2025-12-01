// lib/gameLogic.ts

import { EventCard } from './types';

/**
 * A pool of possible event cards.
 */
export const EVENT_CARDS: EventCard[] = [
  {
    id: 'event-01',
    title: { en: 'Fire!', th: 'ไฟไหม้' },
    description: { en: 'You must lose 5 coins. Please choose which categories to deduct from.', th: 'เลือกเสีย 5 เหรียญ จากช่องอะไรก็ได้' },
    effect: { type: 'COIN_CHANGE', category: 'total', value: -5, isPlayerChoice: true },
  },
  {
    id: 'event-02',
    title: { en: 'Interest Rate Change', th: 'ธนาคารปรับลดอัตราดอกเบี้ย' },
    description: { en: 'Short-term investment rule change for this round: every 4 coins = +1 income.', th: 'ในตานี้, กฏเงินฝากระยะสั้นเปลี่ยนเป็น: ทุกๆ 4 เหรียญ จะได้รายได้เพิ่ม 1 เหรียญ' },
    effect: { type: 'RULE_CHANGE', category: 'short', newRatio: 4 },
  },
  {
    id: 'event-03',
    title: { en: 'Dividend Cut', th: 'บริษัทปรับลดเงินปันผล' },
    description: { en: 'Long-term investment rule change for this round: every 5 coins = +1 income.', th: 'ในตานี้, กฏเงินฝากระยะยาวเปลี่ยนเป็น: ทุกๆ 5 เหรียญ จะได้รายได้เพิ่ม 1 เหรียญ' },
    effect: { type: 'RULE_CHANGE', category: 'long', newRatio: 5 },
  },
  {
    id: 'event-04',
    title: { en: 'Found a Wallet', th: 'เจอกระเป๋าตังตก' },
    description: { en: 'You receive a reward of 3 coins.', th: 'คุณได้รับเงินตอบแทน 3 เหรียญ' },
    effect: { type: 'COIN_CHANGE', category: 'total', value: 3 },
  },
  {
    id: 'event-05',
    title: { en: 'Scammed!', th: 'โดนสแกมเมอร์หลอก' },
    description: { en: 'Lose 3 coins from short-term. You can use your Emergency Fund to cover this loss.', th: 'เสียเงินฝากระยะสั้น 3 เหรียญ' },
    effect: { type: 'COIN_CHANGE', category: 'short', value: -3, isCoverable: true },
  },
  {
    id: 'event-06',
    title: { en: 'Inflation', th: 'เงินเฟ้อ' },
    description: { en: 'Lose 2 coins from long-term. You can use your Emergency Fund to cover this loss.', th: 'เสียเงินฝากระยะยาว 2 เหรียญ' },
    effect: { type: 'COIN_CHANGE', category: 'long', value: -2, isCoverable: true },
  },
  {
    id: 'event-07',
    title: { en: 'Friend Buys Lunch', th: 'เพื่อนเลี้ยงข้าว' },
    description: { en: 'Receive 3 coins for food/housing. Added to total.', th: 'ได้รับเงินค่าอาหาร/ที่อยู่ 3 เหรียญ' },
    effect: { type: 'COIN_CHANGE', category: 'total', value: 3 },
  },
  {
    id: 'event-08',
    title: { en: 'Inheritance', th: 'ได้รับมรดก' },
    description: { en: 'Your income for the next round is boosted by 10 coins.', th: 'รายได้รับเหรียญ 10 เหรียญ' },
    effect: { type: 'INCOME_BOOST', value: 10 },
  },
  {
    id: 'event-09',
    title: { en: 'Friend Pays You Back', th: 'เพื่อนคืนเงิน' },
    description: { en: 'Receive 2 coins.', th: 'ได้รับเงิน 2 เหรียญ' },
    effect: { type: 'COIN_CHANGE', category: 'total', value: 2 },
  },
  {
    id: 'event-10',
    title: { en: 'Free Food for a Year!', th: 'ได้ข้าวกินฟรีปีนึง' },
    description: { en: 'Your food/housing cost is waived for the next round.', th: 'ในรอบหน้าจะได้รับการยกเว้นค่าอาหาร/ที่อยู่' },
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
