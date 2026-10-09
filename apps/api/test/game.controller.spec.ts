import {
  GameApiError,
  GameApiErrorKind,
  GameStateSchema,
} from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { configureApp } from '../src/app-setup.ts';
import { AppModule } from '../src/app.module.ts';
import { UpstreamClient } from '../src/game/upstream.client.ts';

const upstream = {
  createGame: vi.fn(),
  getAds: vi.fn(),
  solveAd: vi.fn(),
  getShop: vi.fn(),
  buyItem: vi.fn(),
  investigateReputation: vi.fn(),
};

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(UpstreamClient)
    .useValue(upstream)
    .compile();

  app = configureApp(moduleRef.createNestApplication());

  await app.init();
});

afterAll(() => app.close());

describe('games API', () => {
  it('starts a game', async () => {
    const state = GameStateSchema.parse(fixtures.start);
    upstream.createGame.mockResolvedValue(state);

    const response = await request(app.getHttpServer()).post('/api/games');

    expect(response.status).toBe(201);
    expect(response.body).toEqual(state);
  });

  it('passes a purchase through with the item id', async () => {
    upstream.buyItem.mockResolvedValue(fixtures.bought);

    const response = await request(app.getHttpServer()).post(
      '/api/games/game1/shop/hpot',
    );

    expect(response.status).toBe(200);
    expect(upstream.buyItem).toHaveBeenCalledWith('game1', 'hpot');
  });

  it('rejects ids that are not safe identifiers', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/games/bad!id/ads',
    );

    expect(response.status).toBe(400);
    expect(upstream.getAds).not.toHaveBeenCalled();
  });

  it.each([
    [GameApiErrorKind.NotFound, 404],
    [GameApiErrorKind.GameOver, 410],
    [GameApiErrorKind.AdUnavailable, 409],
    [GameApiErrorKind.Unavailable, 502],
  ])('turns a %s upstream error into HTTP %d', async (kind, status) => {
    upstream.solveAd.mockRejectedValue(new GameApiError(kind));

    const response = await request(app.getHttpServer()).post(
      '/api/games/game1/ads/ad1/solve',
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
