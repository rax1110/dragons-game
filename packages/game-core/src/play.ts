import { ActionType, decide, type Move } from './decide.ts';
import {
  GameApiError,
  GameApiErrorKind,
  type GameApi,
  type GameState,
} from './game-api.ts';
import { POLICY } from './policy.ts';
import { rankAds } from './ranking.ts';
import { applyBuy, applySolve } from './state.ts';

export type TurnEvent = { move: Move; state: GameState; message: string };

const MAX_UNAVAILABLE_RETRIES = 3;

const perform = async (
  api: GameApi,
  state: GameState,
  move: Move,
): Promise<TurnEvent> => {
  switch (move.type) {
    case ActionType.Solve: {
      const result = await api.solve(state.gameId, move.ad.adId);

      return {
        move,
        state: applySolve(state, result),
        message: result.message,
      };
    }
    case ActionType.Buy: {
      const result = await api.buy(state.gameId, move.item.id);
      const message = result.shoppingSuccess
        ? `Bought ${move.item.name}`
        : `Could not buy ${move.item.name}`;

      return { move, state: applyBuy(state, result), message };
    }
  }
};

export async function* play(
  api: GameApi,
  start: GameState,
): AsyncGenerator<TurnEvent, GameState> {
  const shop = await api.shop(start.gameId);
  let state = start;
  let dryTurns = 0;
  let unavailableAds = 0;

  while (state.lives > 0 && state.turn < POLICY.maxTurns) {
    const ads = rankAds(await api.ads(state.gameId), state.lives);
    const action = decide(state, ads, shop, dryTurns);

    if (action.type === ActionType.Stop) return state;

    try {
      const event = await perform(api, state, action);

      dryTurns = ads[0]?.recommended ? 0 : dryTurns + 1;
      unavailableAds = 0;
      state = event.state;

      yield event;
    } catch (error) {
      if (!(error instanceof GameApiError)) throw error;

      const { kind } = error;

      if (kind === GameApiErrorKind.GameOver) return { ...state, lives: 0 };
      if (kind !== GameApiErrorKind.AdUnavailable) throw error;

      unavailableAds += 1;

      if (unavailableAds > MAX_UNAVAILABLE_RETRIES) throw error;
    }
  }

  return state;
}
