import {
  ActionType,
  decodeAds,
  GameApiError,
  GameApiErrorKind,
  GameStateSchema,
  ShopSchema,
} from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { configureApp } from '../src/app-setup.ts';
import { AppModule } from '../src/app.module.ts';
import { UpstreamClient } from '../src/game/upstream.client.ts';

const state = GameStateSchema.parse(fixtures.start);
const shop = ShopSchema.parse(fixtures.shop);
const ads = decodeAds([fixtures.plainAd, fixtures.base64Ad]);
const gamePath = `/api/games/${state.gameId}`;

const upstream = {
  createGame: vi.fn(),
  getAds: vi.fn(),
  solveAd: vi.fn(),
  getShop: vi.fn(),
  buyItem: vi.fn(),
  investigateReputation: vi.fn(),
};

let app: INestApplication;

const createGame = () => request(app.getHttpServer()).post('/api/games');
const loadAds = () => request(app.getHttpServer()).get(`${gamePath}/ads`);

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(UpstreamClient)
    .useValue(upstream)
    .compile();

  app = configureApp(moduleRef.createNestApplication());

  await app.init();
});

afterAll(() => app.close());

beforeEach(() => {
  upstream.createGame.mockResolvedValue(state);
  upstream.getShop.mockResolvedValue(shop);
  upstream.getAds.mockResolvedValue(ads);
  upstream.solveAd.mockResolvedValue(fixtures.solved);
  upstream.buyItem.mockResolvedValue(fixtures.bought);
});

describe('games API', () => {
  it('creates a game and returns its snapshot', async () => {
    const response = await createGame();

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ state, shop });
  });

  it('returns the snapshot of an existing game', async () => {
    await createGame();

    const response = await request(app.getHttpServer()).get(gamePath);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ state, shop });
  });

  it('answers 404 for an unknown game', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/games/unknown',
    );

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ kind: GameApiErrorKind.NotFound });
  });

  it('rejects ids that are not safe identifiers', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/games/bad!id/ads',
    );

    expect(response.status).toBe(400);
    expect(upstream.getAds).not.toHaveBeenCalled();
  });

  it('ranks the ads and recommends exactly one', async () => {
    await createGame();

    const response = await loadAds();
    const recommended = response.body.filter(
      (ad: { recommended: boolean }) => ad.recommended,
    );

    expect(response.status).toBe(200);
    expect(recommended).toHaveLength(1);
    expect(recommended[0]).toMatchObject({
      adId: 'cx6vhNAH',
      successRate: 0.95,
    });
  });

  it('solves an ad that is on offer and returns the turn', async () => {
    await createGame();
    await loadAds();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/ads/cx6vhNAH/solve`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      move: { type: ActionType.Solve, ad: { adId: 'cx6vhNAH' } },
      state: { score: fixtures.solved.score, turn: fixtures.solved.turn },
      succeeded: true,
    });
  });

  it('refuses to solve an ad that is not on offer', async () => {
    await createGame();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/ads/cx6vhNAH/solve`,
    );

    expect(response.status).toBe(409);
    expect(upstream.solveAd).not.toHaveBeenCalled();
  });

  it('buys an item from the shop and returns the turn', async () => {
    await createGame();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/shop/hpot`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      move: { type: ActionType.Buy, item: { id: 'hpot' } },
      state: { lives: fixtures.bought.lives },
      message: 'Bought Healing potion',
    });
  });

  it('refuses an item the shop does not sell', async () => {
    await createGame();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/shop/sword`,
    );

    expect(response.status).toBe(404);
    expect(upstream.buyItem).not.toHaveBeenCalled();
  });

  it('charges a turn for investigating reputation', async () => {
    upstream.investigateReputation.mockResolvedValue(fixtures.reputation);
    await createGame();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/reputation`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      reputation: fixtures.reputation,
      state: { ...state, turn: state.turn + 1 },
    });
  });

  it('plays one bot turn', async () => {
    await createGame();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/turns`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ move: { type: ActionType.Solve } });
  });

  it('answers 204 once the game is over', async () => {
    upstream.createGame.mockResolvedValue({ ...state, lives: 0 });
    await createGame();

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/turns`,
    );

    expect(response.status).toBe(204);
  });

  it.each([
    [GameApiErrorKind.GameOver, 410],
    [GameApiErrorKind.AdUnavailable, 409],
    [GameApiErrorKind.Unavailable, 502],
  ])('turns a %s upstream error into HTTP %d', async (kind, status) => {
    await createGame();
    await loadAds();
    upstream.solveAd.mockRejectedValue(new GameApiError(kind));

    const response = await request(app.getHttpServer()).post(
      `${gamePath}/ads/cx6vhNAH/solve`,
    );

    expect(response.status).toBe(status);
    expect(response.body).toMatchObject({ statusCode: status, kind });
  });

  it('publishes an OpenAPI document with zod-derived schemas', async () => {
    const response = await request(app.getHttpServer()).get('/api/docs-json');
    const adsResponse =
      response.body.paths['/api/games/{gameId}/ads'].get.responses['200'];

    expect(response.status).toBe(200);
    expect(adsResponse.content['application/json'].schema).toMatchObject({
      type: 'array',
    });
  });
});
