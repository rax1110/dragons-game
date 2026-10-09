import {
  getLevelsGained,
  POTION_ID,
  type RankedAd,
  type ShopItem,
} from '@dragons/game-core';

export const Risk = {
  Safe: 'safe',
  Moderate: 'moderate',
  Deadly: 'deadly',
} as const;
export type Risk = (typeof Risk)[keyof typeof Risk];

const MODERATE_SUCCESS_RATE = 0.3;

export const formatPercent = (rate: number) => `${Math.round(rate * 100)}%`;

export const formatTurns = (turns: number) =>
  turns === 1 ? '1 turn' : `${turns} turns`;

export const deriveRisk = (ad: RankedAd): Risk => {
  if (ad.viable) return Risk.Safe;
  if (ad.successRate >= MODERATE_SUCCESS_RATE) return Risk.Moderate;

  return Risk.Deadly;
};

export const describeItem = (item: ShopItem) => {
  if (item.id === POTION_ID) return '+1 life';

  const levels = getLevelsGained(item);

  return levels === 1 ? '+1 level' : `+${levels} levels`;
};
