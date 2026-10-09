import {
  AdIdSchema,
  GAME_API_BASE_URL,
  GameApiErrorKind,
  GameIdSchema,
  ItemIdSchema,
} from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UpstreamClient } from '../src/game/upstream.client.ts';

const gameId = GameIdSchema.parse('game1');
const adId = AdIdSchema.parse('ad1');
const itemId = ItemIdSchema.parse('hpot');

const buildResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('UpstreamClient', () => {
  const client = new UpstreamClient();
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('parses and decodes the ads', async () => {
    fetchMock.mockResolvedValue(
      buildResponse([fixtures.plainAd, fixtures.base64Ad]),
    );

    await expect(client.getAds(gameId)).resolves.toMatchObject([
      { adId: 'cx6vhNAH', encoding: 'plain' },
      { adId: 'fUz5K6BS', encoding: 'base64' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${GAME_API_BASE_URL}/game1/messages`,
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it.each([
    [404, GameApiErrorKind.NotFound],
    [410, GameApiErrorKind.GameOver],
    [400, GameApiErrorKind.AdUnavailable],
    [503, GameApiErrorKind.Unavailable],
  ])('maps HTTP %d to %s', async (status, kind) => {
    fetchMock.mockResolvedValue(buildResponse({}, status));

    await expect(client.solveAd(gameId, adId)).rejects.toMatchObject({ kind });
  });

  it('retries reads after an upstream failure', async () => {
    fetchMock
      .mockResolvedValueOnce(buildResponse({}, 503))
      .mockResolvedValueOnce(buildResponse(fixtures.shop));

    const shop = client.getShop(gameId);

    await vi.runAllTimersAsync();

    await expect(shop).resolves.toHaveLength(fixtures.shop.length);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up reads once the retries are exhausted', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const outcome = expect(client.getShop(gameId)).rejects.toMatchObject({
      kind: GameApiErrorKind.Unavailable,
    });

    await vi.runAllTimersAsync();
    await outcome;

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('never retries writes', async () => {
    fetchMock.mockResolvedValue(buildResponse({}, 503));

    await expect(client.buyItem(gameId, itemId)).rejects.toMatchObject({
      kind: GameApiErrorKind.Unavailable,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects payloads that do not match the schema', async () => {
    fetchMock.mockResolvedValue(buildResponse({ unexpected: true }));

    await expect(client.createGame()).rejects.toMatchObject({
      kind: GameApiErrorKind.Unavailable,
    });
  });
});
