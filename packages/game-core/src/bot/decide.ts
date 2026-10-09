import {
  ActionType,
  type Action,
  type GameState,
  type RankedAd,
  type ShopItem,
} from '../contract/game-api.ts';
import { findCheapestUpgrade, findPotion } from '../shop/catalog.ts';
import { POLICY } from './policy.ts';

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
  const reserve = potion?.cost ?? 0;
  const heal = potion && gold >= potion.cost ? buildBuy(potion) : null;
  const mayUpgrade = lives >= POLICY.upgradeMinLives && level < POLICY.maxLevel;
  const upgrade = mayUpgrade ? findCheapestUpgrade(shop, gold - reserve) : null;
  const fallback = best ? buildSolve(best) : stop;

  if (lives < POLICY.targetLives && heal) return heal;
  if (dryTurns >= POLICY.hopelessAfter) return fallback;
  if (upgrade) return buildBuy(upgrade);
  if (best?.recommended) return buildSolve(best);
  if (heal) return heal;

  return fallback;
};
