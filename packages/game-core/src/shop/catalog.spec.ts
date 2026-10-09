import { describe, expect, it } from 'vitest';
import { ShopItemSchema, ShopSchema } from '../contract/game-api.ts';
import { fixtures } from '../fixtures.ts';
import {
  findCheapestUpgrade,
  findPotion,
  getLevelsGained,
  POTION_ID,
} from './catalog.ts';

const shop = ShopSchema.parse(fixtures.shop);

describe('shop catalog', () => {
  it('finds the healing potion', () => {
    expect(findPotion(shop)?.name).toBe('Healing potion');
  });

  it('knows every upgrade the real shop sells', () => {
    const upgrades = shop.filter((item) => item.id !== POTION_ID);

    expect(upgrades.every((item) => getLevelsGained(item) > 0)).toBe(true);
  });

  it('prefers the cheapest gold per level, then the cheapest item', () => {
    expect(findCheapestUpgrade(shop, 1000)?.id).toBe('cs');
  });

  it('falls back to a 300-gold upgrade when no 100-gold one is on offer', () => {
    const expensiveOnly = shop.filter((item) => item.cost !== 100);

    expect(findCheapestUpgrade(expensiveOnly, 300)?.id).toBe('ch');
  });

  it('returns nothing when no upgrade is affordable', () => {
    expect(findCheapestUpgrade(shop, 99)).toBeNull();
  });

  it('never buys an item it does not know', () => {
    const mystery = ShopItemSchema.parse({
      id: 'mystery',
      name: 'Mystery box',
      cost: 1,
    });

    expect(findCheapestUpgrade([mystery], 100)).toBeNull();
  });
});
