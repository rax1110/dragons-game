import type { GameState, ShopItem } from './game-api.ts';
import { POLICY } from './policy.ts';
import type { RankedAd } from './ranking.ts';
import { findCheapestUpgrade, findPotion } from './shop.ts';

export const ActionType = {
  Solve: 'solve',
  Buy: 'buy',
  Stop: 'stop',
} as const;

export type Move =
  | { type: typeof ActionType.Solve; ad: RankedAd }
  | { type: typeof ActionType.Buy; item: ShopItem };
export type Action = Move | { type: typeof ActionType.Stop };

const buildSolve = (ad: RankedAd): Action => ({ type: ActionType.Solve, ad });
const buildBuy = (item: ShopItem): Action => ({ type: ActionType.Buy, item });
const stop: Action = { type: ActionType.Stop };

export const decide = (
  state: GameState,
  ads: readonly RankedAd[],
  shop: readonly ShopItem[],
  dryTurns: number,
): Action => {
  const { lives, gold, level } = state;
  const best = ads[0];
  const potion = findPotion(shop);
  const heal = potion && gold >= potion.cost ? buildBuy(potion) : null;
  const mayUpgrade = lives >= POLICY.upgradeMinLives && level < POLICY.maxLevel;
  const upgrade = mayUpgrade ? findCheapestUpgrade(shop, gold) : null;
  const fallback = best ? buildSolve(best) : stop;

  if (dryTurns >= POLICY.hopelessAfter) return fallback;
  if (lives < POLICY.targetLives && heal) return heal;
  if (upgrade) return buildBuy(upgrade);
  if (best?.recommended) return buildSolve(best);
  if (heal) return heal;

  return fallback;
};
