import {
  ActionType,
  AdIdSchema,
  GameApiError,
  GameApiErrorKind,
  GameStateSchema,
  ShopItemSchema,
  ShopSchema,
  type TurnEvent,
} from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gameApi } from './game-api.ts';
import { Phase, useGameStore } from './game-store.ts';

vi.mock('./game-api.ts', () => ({
  gameApi: {
    createGame: vi.fn(),
    getGame: vi.fn(),
    getAds: vi.fn(),
    solveAd: vi.fn(),
    buyItem: vi.fn(),
    playTurn: vi.fn(),
    investigateReputation: vi.fn(),
  },
}));

const state = GameStateSchema.parse(fixtures.start);
const shop = ShopSchema.parse(fixtures.shop);
const potion = ShopItemSchema.parse(fixtures.shop[0]);
const adId = AdIdSchema.parse(fixtures.plainAd.adId);
const solvedState = { ...state, score: 8, gold: 8, turn: 3 };
const event: TurnEvent = {
  move: { type: ActionType.Buy, item: potion },
  state: solvedState,
  message: 'Bought Healing potion',
  succeeded: true,
};
const finalEvent: TurnEvent = {
  ...event,
  state: { ...solvedState, lives: 0 },
  message: 'You were defeated on your last mission!',
  succeeded: false,
};

describe('game store', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
    vi.mocked(gameApi.createGame).mockResolvedValue({ state, shop });
    vi.mocked(gameApi.getAds).mockResolvedValue([]);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts a game and loads its ads', async () => {
    await useGameStore.getState().createGame();

    expect(useGameStore.getState()).toMatchObject({
      gameId: state.gameId,
      state,
      shop,
      phase: Phase.Idle,
    });
    expect(gameApi.getAds).toHaveBeenCalledWith(state.gameId);
  });

  it('applies the turn after a purchase and refreshes the ads', async () => {
    vi.mocked(gameApi.buyItem).mockResolvedValue(event);
    await useGameStore.getState().createGame();

    await useGameStore.getState().buyItem(potion.id);

    expect(useGameStore.getState()).toMatchObject({
      state: solvedState,
      events: [event],
    });
    expect(gameApi.getAds).toHaveBeenCalledTimes(2);
  });

  it('stops refreshing ads once the final turn ends the game', async () => {
    vi.mocked(gameApi.solveAd).mockResolvedValue(finalEvent);
    await useGameStore.getState().createGame();

    await useGameStore.getState().solveAd(adId);

    expect(useGameStore.getState()).toMatchObject({
      state: finalEvent.state,
      error: null,
    });
    expect(gameApi.getAds).toHaveBeenCalledTimes(1);
  });

  it('explains a failed request in plain words and returns to idle', async () => {
    vi.mocked(gameApi.createGame).mockRejectedValue(
      new GameApiError(
        GameApiErrorKind.Unavailable,
        'Game API responded with 503',
      ),
    );

    await useGameStore.getState().createGame();

    expect(useGameStore.getState()).toMatchObject({
      error: 'The game server is not answering. Try again in a moment.',
      phase: Phase.Idle,
      gameId: null,
    });
  });

  it('refreshes the ads when the chosen one was no longer on offer', async () => {
    await useGameStore.getState().createGame();
    vi.mocked(gameApi.solveAd).mockRejectedValue(
      new GameApiError(GameApiErrorKind.AdUnavailable),
    );

    await useGameStore.getState().solveAd(adId);

    expect(useGameStore.getState().error).toBe(
      'That ad is no longer on offer. Pick another one.',
    );
    expect(gameApi.getAds).toHaveBeenCalledTimes(2);
  });

  it('charges the turn an investigation costs', async () => {
    await useGameStore.getState().createGame();
    vi.mocked(gameApi.investigateReputation).mockResolvedValue({
      reputation: fixtures.reputation,
      state: { ...state, turn: 1 },
    });

    await useGameStore.getState().investigateReputation();

    expect(useGameStore.getState()).toMatchObject({
      reputation: fixtures.reputation,
      state: { turn: 1 },
    });
  });

  it('ends the game quietly when the server reports it is over', async () => {
    await useGameStore.getState().createGame();
    vi.mocked(gameApi.solveAd).mockRejectedValue(
      new GameApiError(GameApiErrorKind.GameOver),
    );

    await useGameStore.getState().solveAd(adId);

    expect(useGameStore.getState()).toMatchObject({
      state: { lives: 0 },
      error: null,
    });
  });

  it('plays bot turns until the server has none left', async () => {
    await useGameStore.getState().createGame();
    vi.mocked(gameApi.playTurn)
      .mockResolvedValueOnce(event)
      .mockResolvedValueOnce(null);

    const autoplay = useGameStore.getState().startAutoplay();

    await vi.runAllTimersAsync();
    await autoplay;

    expect(gameApi.playTurn).toHaveBeenCalledTimes(2);
    expect(useGameStore.getState()).toMatchObject({
      state: solvedState,
      phase: Phase.Idle,
    });
  });

  it('remembers only the game id across reloads', () => {
    useGameStore.setState({ gameId: state.gameId, state, shop });

    const persisted = JSON.parse(
      sessionStorage.getItem('dragons-game') ?? '{}',
    );

    expect(persisted.state).toEqual({ gameId: state.gameId });
  });
});
