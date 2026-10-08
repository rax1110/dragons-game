import type { ShopItem } from './game-api.ts';

export const POTION_ID = 'hpot';

const LEVELS_PER_ITEM = new Map([
  ['cs', 1],
  ['gas', 1],
  ['wax', 1],
  ['tricks', 1],
  ['wingpot', 1],
  ['ch', 2],
  ['rf', 2],
  ['iron', 2],
  ['mtrix', 2],
  ['wingpotmax', 2],
]);

export const getLevelsGained = (item: ShopItem): number =>
  LEVELS_PER_ITEM.get(item.id) ?? 0;

export const findPotion = (shop: readonly ShopItem[]): ShopItem | null =>
  shop.find((item) => item.id === POTION_ID) ?? null;

const compareByCostPerLevel = (a: ShopItem, b: ShopItem) =>
  a.cost / getLevelsGained(a) - b.cost / getLevelsGained(b) || a.cost - b.cost;

export const findCheapestUpgrade = (
  shop: readonly ShopItem[],
  gold: number,
): ShopItem | null =>
  shop
    .filter((item) => getLevelsGained(item) > 0 && item.cost <= gold)
    .toSorted(compareByCostPerLevel)[0] ?? null;
