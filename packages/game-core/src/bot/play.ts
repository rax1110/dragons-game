import { rankAds } from '../ads/ranking.ts';
import {
  ActionType,
  GameApiError,
  GameApiErrorKind,
  type GameApi,
  type GameState,
  type Move,
  type ShopItem,
  type TurnEvent,
} from '../contract/game-api.ts';
import { decide } from './decide.ts';
import { POLICY } from './policy.ts';
import { applyBuy, applySolve } from './state.ts';

export type TurnOutcome = {
  event: TurnEvent | null;
  state: GameState;
  dryTurns: number;
};

const MAX_UNAVAILABLE_RETRIES = 3;

const buildEnd = (state: GameState, dryTurns: number): TurnOutcome => ({
  event: null,
  state,
  dryTurns,
});

export const canContinue = (state: GameState) =>
  state.lives > 0 && state.turn < POLICY.maxTurns;

export const performMove = async (
  api: GameApi,
  state: GameState,
  move: Move,
): Promise<TurnEvent> => {
  switch (move.type) {
    case ActionType.Solve: {
      const result = await api.solveAd(state.gameId, move.ad.adId);

      return {
        move,
        state: applySolve(state, result),
        message: result.message,
        succeeded: result.success,
      };
    }
    case ActionType.Buy: {
      const result = await api.buyItem(state.gameId, move.item.id);
      const message = result.shoppingSuccess
        ? `Bought ${move.item.name}`
        : `Could not buy ${move.item.name}`;

      return {
        move,
        state: applyBuy(state, result),
        message,
        succeeded: result.shoppingSuccess,
      };
    }
  }
};

export const takeTurn = async (
  api: GameApi,
  state: GameState,
  shop: readonly ShopItem[],
  dryTurns: number,
  attempt = 1,
): Promise<TurnOutcome> => {
  if (!canContinue(state)) return buildEnd(state, dryTurns);

  const ads = rankAds(await api.getAds(state.gameId), state.lives);
  const action = decide(state, ads, shop, dryTurns);

  if (action.type === ActionType.Stop) return buildEnd(state, dryTurns);

  try {
    const event = await performMove(api, state, action);
    const nextDryTurns = ads[0]?.recommended ? 0 : dryTurns + 1;

    return { event, state: event.state, dryTurns: nextDryTurns };
  } catch (error) {
    if (!(error instanceof GameApiError)) throw error;

    const { kind } = error;
    const gameOver = kind === GameApiErrorKind.GameOver;

    if (gameOver) return buildEnd({ ...state, lives: 0 }, dryTurns);
    if (kind !== GameApiErrorKind.AdUnavailable) throw error;
    if (attempt >= MAX_UNAVAILABLE_RETRIES) throw error;

    return takeTurn(api, state, shop, dryTurns, attempt + 1);
  }
};

export async function* play(
  api: GameApi,
  start: GameState,
): AsyncGenerator<TurnEvent, GameState> {
  const shop = await api.getShop(start.gameId);
  let outcome = await takeTurn(api, start, shop, 0);

  while (outcome.event) {
    yield outcome.event;

    outcome = await takeTurn(api, outcome.state, shop, outcome.dryTurns);
  }

  return outcome.state;
}
