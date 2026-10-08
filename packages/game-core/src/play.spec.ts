import { describe, expect, it, vi } from 'vitest';
import { ActionType } from './decide.ts';
import { decodeAd } from './decode.ts';
import { fixtures } from './fixtures.ts';
import {
  BuyResultSchema,
  GameApiError,
  GameApiErrorKind,
  GameStateSchema,
  ShopSchema,
  SolveResultSchema,
  type GameApi,
  type GameState,
} from './game-api.ts';
import { play, type TurnEvent } from './play.ts';
import { POLICY } from './policy.ts';
import { POTION_ID } from './shop.ts';

const start = GameStateSchema.parse(fixtures.start);
const viableAd = decodeAd(fixtures.plainAd);
const solved = SolveResultSchema.parse(fixtures.solved);

const createFakeApi = (overrides: Partial<GameApi> = {}): GameApi => ({
  start: vi.fn(async () => start),
  ads: vi.fn(async () => (viableAd ? [viableAd] : [])),
  solve: vi.fn(async () => solved),
  shop: vi.fn(async () => ShopSchema.parse(fixtures.shop)),
  buy: vi.fn(async () => BuyResultSchema.parse(fixtures.bought)),
  reputation: vi.fn(async () => fixtures.reputation),
  ...overrides,
});

const run = async (api: GameApi, from: GameState = start) => {
  const game = play(api, from);
  const events: TurnEvent[] = [];

  let next = await game.next();

  while (!next.done) {
    events.push(next.value);
    next = await game.next();
  }

  return { events, final: next.value };
};

describe('play', () => {
  it('plays turn by turn until lives run out', async () => {
    const solve = [3, 2, 1, 0].reduce(
      (mock, lives) => mock.mockResolvedValueOnce({ ...solved, lives }),
      vi.fn<GameApi['solve']>(),
    );
    const api = createFakeApi({ solve });

    const { events, final } = await run(api);

    expect(events.map((event) => event.state.lives)).toEqual([3, 2, 1, 0]);
    expect(events[0]?.move).toMatchObject({
      type: ActionType.Solve,
      ad: { adId: 'cx6vhNAH' },
    });
    expect(final.lives).toBe(0);
  });

  it('heals before solving when lives are below target', async () => {
    const api = createFakeApi({
      solve: vi.fn(async () => ({ ...solved, lives: 0 })),
    });

    const { events } = await run(api, { ...start, lives: 2, gold: 60 });

    expect(events.map((event) => event.move.type)).toEqual([
      ActionType.Buy,
      ActionType.Solve,
    ]);
    expect(events[0]?.move).toMatchObject({ item: { id: POTION_ID } });
    expect(events[0]?.message).toBe('Bought Healing potion');
  });

  it('refetches ads when the chosen one has expired', async () => {
    const api = createFakeApi({
      solve: vi
        .fn<GameApi['solve']>()
        .mockRejectedValueOnce(new GameApiError(GameApiErrorKind.AdUnavailable))
        .mockResolvedValue({ ...solved, lives: 0 }),
    });

    const { events } = await run(api);

    expect(api.ads).toHaveBeenCalledTimes(2);
    expect(events).toHaveLength(1);
  });

  it('gives up after repeated expired ads', async () => {
    const api = createFakeApi({
      solve: vi.fn(async () => {
        throw new GameApiError(GameApiErrorKind.AdUnavailable);
      }),
    });

    await expect(run(api)).rejects.toMatchObject({
      kind: GameApiErrorKind.AdUnavailable,
    });
  });

  it('ends the game when the API reports it is over', async () => {
    const api = createFakeApi({
      solve: vi.fn(async () => {
        throw new GameApiError(GameApiErrorKind.GameOver);
      }),
    });

    const { events, final } = await run(api);

    expect(events).toEqual([]);
    expect(final.lives).toBe(0);
  });

  it('propagates unexpected errors', async () => {
    const api = createFakeApi({
      solve: vi.fn(async () => {
        throw new Error('network down');
      }),
    });

    await expect(run(api)).rejects.toThrow('network down');
  });

  it('stops at the turn limit', async () => {
    const api = createFakeApi({
      solve: vi.fn(async () => ({ ...solved, turn: POLICY.maxTurns })),
    });

    const { events, final } = await run(api);

    expect(events).toHaveLength(1);
    expect(final.turn).toBe(POLICY.maxTurns);
  });

  it('stops when there is nothing to do', async () => {
    const api = createFakeApi({ ads: vi.fn(async () => []) });

    const { events, final } = await run(api);

    expect(events).toEqual([]);
    expect(final).toEqual(start);
  });
});
