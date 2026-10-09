import {
  GameApiError,
  GameApiErrorKind,
  type GameId,
  type GameState,
  type RankedAd,
  type ShopItem,
} from '@dragons/game-core';
import { Injectable } from '@nestjs/common';

export type GameSession = {
  state: GameState;
  shop: ShopItem[];
  ads: RankedAd[];
  dryTurns: number;
};

const MAX_SESSIONS = 1000;

const buildUnknownGameError = (gameId: GameId) =>
  new GameApiError(GameApiErrorKind.NotFound, `Unknown game ${gameId}`);

@Injectable()
export class GameSessionStore {
  private readonly sessions = new Map<GameId, GameSession>();

  get(gameId: GameId): GameSession {
    const session = this.sessions.get(gameId);

    if (!session) throw buildUnknownGameError(gameId);

    return session;
  }

  save(gameId: GameId, session: GameSession) {
    this.sessions.delete(gameId);
    this.sessions.set(gameId, session);

    if (this.sessions.size > MAX_SESSIONS) this.evictOldest();
  }

  private evictOldest() {
    const [oldest] = this.sessions.keys();

    if (oldest) this.sessions.delete(oldest);
  }
}
