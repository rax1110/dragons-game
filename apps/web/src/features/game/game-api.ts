import {
  ApiErrorSchema,
  GameApiError,
  GameApiErrorKind,
  GameSnapshotSchema,
  RankedAdSchema,
  ReputationReportSchema,
  TurnEventSchema,
  type AdId,
  type GameId,
  type ItemId,
} from '@dragons/game-core';
import type { ZodType } from 'zod';

const buildUnreachableError = (cause: unknown) =>
  new GameApiError(GameApiErrorKind.Unavailable, 'The server is unreachable', {
    cause,
  });

const buildResponseError = async (response: Response) => {
  const body = ApiErrorSchema.safeParse(
    await response.json().catch(() => null),
  );

  return body.success
    ? new GameApiError(body.data.kind, body.data.message)
    : new GameApiError(
        GameApiErrorKind.Unavailable,
        `The server responded with ${response.status}`,
      );
};

const readBody = (response: Response) =>
  response.status === 204 ? null : response.json();

const request = async <T>(
  method: RequestInit['method'],
  path: string,
  schema: ZodType<T>,
) => {
  const response = await fetch(`/api${path}`, { method }).catch(
    (cause: unknown) => {
      throw buildUnreachableError(cause);
    },
  );

  if (!response.ok) throw await buildResponseError(response);

  return schema.parse(await readBody(response));
};

export const gameApi = {
  createGame: () => request('POST', '/games', GameSnapshotSchema),
  getGame: (gameId: GameId) =>
    request('GET', `/games/${gameId}`, GameSnapshotSchema),
  getAds: (gameId: GameId) =>
    request('GET', `/games/${gameId}/ads`, RankedAdSchema.array()),
  solveAd: (gameId: GameId, adId: AdId) =>
    request('POST', `/games/${gameId}/ads/${adId}/solve`, TurnEventSchema),
  buyItem: (gameId: GameId, itemId: ItemId) =>
    request('POST', `/games/${gameId}/shop/${itemId}`, TurnEventSchema),
  playTurn: (gameId: GameId) =>
    request('POST', `/games/${gameId}/turns`, TurnEventSchema.nullable()),
  investigateReputation: (gameId: GameId) =>
    request('POST', `/games/${gameId}/reputation`, ReputationReportSchema),
};
