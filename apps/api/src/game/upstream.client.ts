import {
  BuyResultSchema,
  decodeAds,
  GameApiError,
  GameApiErrorKind,
  GameStateSchema,
  RawAdSchema,
  ReputationSchema,
  ShopSchema,
  SolveResultSchema,
  type Ad,
  type AdId,
  type BuyResult,
  type GameApi,
  type GameId,
  type GameState,
  type ItemId,
  type Reputation,
  type ShopItem,
  type SolveResult,
} from '@dragons/game-core';
import { HttpStatus, Injectable } from '@nestjs/common';
import type { ZodType } from 'zod';
import { config } from '../config.ts';

const READ_RETRY_DELAYS_MS = [250, 500, 1000];

const ERROR_KIND_BY_STATUS = new Map<number, GameApiErrorKind>([
  [HttpStatus.BAD_REQUEST, GameApiErrorKind.AdUnavailable],
  [HttpStatus.NOT_FOUND, GameApiErrorKind.NotFound],
  [HttpStatus.GONE, GameApiErrorKind.GameOver],
]);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryable = (error: unknown) =>
  error instanceof GameApiError && error.kind === GameApiErrorKind.Unavailable;

const buildStatusError = (status: number) => {
  const kind = ERROR_KIND_BY_STATUS.get(status) ?? GameApiErrorKind.Unavailable;

  return new GameApiError(kind, `Game API responded with ${status}`);
};

const buildNetworkError = (cause: unknown) =>
  new GameApiError(GameApiErrorKind.Unavailable, 'Game API unreachable', {
    cause,
  });

const buildPayloadError = () =>
  new GameApiError(
    GameApiErrorKind.Unavailable,
    'Unexpected response from the game API',
  );

@Injectable()
export class UpstreamClient implements GameApi {
  createGame(): Promise<GameState> {
    return this.post('/game/start', GameStateSchema);
  }

  async getAds(gameId: GameId): Promise<Ad[]> {
    return decodeAds(
      await this.get(`/${gameId}/messages`, RawAdSchema.array()),
    );
  }

  solveAd(gameId: GameId, adId: AdId): Promise<SolveResult> {
    return this.post(`/${gameId}/solve/${adId}`, SolveResultSchema);
  }

  getShop(gameId: GameId): Promise<ShopItem[]> {
    return this.get(`/${gameId}/shop`, ShopSchema);
  }

  buyItem(gameId: GameId, itemId: ItemId): Promise<BuyResult> {
    return this.post(`/${gameId}/shop/buy/${itemId}`, BuyResultSchema);
  }

  investigateReputation(gameId: GameId): Promise<Reputation> {
    return this.post(`/${gameId}/investigate/reputation`, ReputationSchema);
  }

  private get<T>(path: string, schema: ZodType<T>) {
    return this.request('GET', path, schema, READ_RETRY_DELAYS_MS);
  }

  private post<T>(path: string, schema: ZodType<T>) {
    return this.request('POST', path, schema, []);
  }

  private async request<T>(
    method: RequestInit['method'],
    path: string,
    schema: ZodType<T>,
    retryDelays: readonly number[],
  ): Promise<T> {
    const [delay, ...remainingDelays] = retryDelays;

    try {
      return await this.send(method, path, schema);
    } catch (error) {
      if (!delay || !isRetryable(error)) throw error;

      await sleep(delay);

      return this.request(method, path, schema, remainingDelays);
    }
  }

  private async send<T>(
    method: RequestInit['method'],
    path: string,
    schema: ZodType<T>,
  ): Promise<T> {
    const signal = AbortSignal.timeout(config.gameApiTimeoutMs);
    const response = await fetch(`${config.gameApiBaseUrl}${path}`, {
      method,
      signal,
    }).catch((cause: unknown) => {
      throw buildNetworkError(cause);
    });

    if (!response.ok) throw buildStatusError(response.status);

    const parsed = schema.safeParse(await response.json().catch(() => null));

    if (!parsed.success) throw buildPayloadError();

    return parsed.data;
  }
}
