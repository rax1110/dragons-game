import {
  ActionType,
  GameApiError,
  GameApiErrorKind,
  performMove,
  rankAds,
  takeTurn,
  type AdId,
  type GameId,
  type GameSnapshot,
  type ItemId,
  type RankedAd,
  type ReputationReport,
  type TurnEvent,
} from '@dragons/game-core';
import { Injectable } from '@nestjs/common';
import { GameSessionStore } from './game-session.store.ts';
import { UpstreamClient } from './upstream.client.ts';

const buildAdUnavailableError = (adId: AdId) =>
  new GameApiError(
    GameApiErrorKind.AdUnavailable,
    `Ad ${adId} is not on offer`,
  );

const buildUnknownItemError = (itemId: ItemId) =>
  new GameApiError(GameApiErrorKind.NotFound, `Unknown item ${itemId}`);

@Injectable()
export class GameService {
  constructor(
    private readonly upstream: UpstreamClient,
    private readonly sessions: GameSessionStore,
  ) {}

  async createGame(): Promise<GameSnapshot> {
    const state = await this.upstream.createGame();
    const shop = await this.upstream.getShop(state.gameId);

    this.sessions.save(state.gameId, { state, shop, ads: [], dryTurns: 0 });

    return { state, shop };
  }

  getGame(gameId: GameId): GameSnapshot {
    const { state, shop } = this.sessions.get(gameId);

    return { state, shop };
  }

  async getAds(gameId: GameId): Promise<RankedAd[]> {
    const session = this.sessions.get(gameId);
    const ads = rankAds(
      await this.upstream.getAds(gameId),
      session.state.lives,
    );

    this.sessions.save(gameId, { ...session, ads });

    return ads;
  }

  async solveAd(gameId: GameId, adId: AdId): Promise<TurnEvent> {
    const session = this.sessions.get(gameId);
    const ad = session.ads.find((candidate) => candidate.adId === adId);

    if (!ad) throw buildAdUnavailableError(adId);

    const event = await performMove(this.upstream, session.state, {
      type: ActionType.Solve,
      ad,
    });

    this.sessions.save(gameId, { ...session, state: event.state });

    return event;
  }

  async buyItem(gameId: GameId, itemId: ItemId): Promise<TurnEvent> {
    const session = this.sessions.get(gameId);
    const item = session.shop.find((candidate) => candidate.id === itemId);

    if (!item) throw buildUnknownItemError(itemId);

    const event = await performMove(this.upstream, session.state, {
      type: ActionType.Buy,
      item,
    });

    this.sessions.save(gameId, { ...session, state: event.state });

    return event;
  }

  async playTurn(gameId: GameId): Promise<TurnEvent | null> {
    const session = this.sessions.get(gameId);
    const outcome = await takeTurn(
      this.upstream,
      session.state,
      session.shop,
      session.dryTurns,
    );

    this.sessions.save(gameId, {
      ...session,
      state: outcome.state,
      dryTurns: outcome.dryTurns,
    });

    return outcome.event;
  }

  async investigateReputation(gameId: GameId): Promise<ReputationReport> {
    const session = this.sessions.get(gameId);
    const reputation = await this.upstream.investigateReputation(gameId);
    const state = { ...session.state, turn: session.state.turn + 1 };

    this.sessions.save(gameId, { ...session, state });

    return { reputation, state };
  }
}
