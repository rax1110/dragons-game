import { GameIdSchema, GameStateSchema } from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { describe, expect, it } from 'vitest';
import {
  GameSessionStore,
  type GameSession,
} from '../src/game/game-session.store.ts';

const buildSession = (gameId: string): GameSession => ({
  state: GameStateSchema.parse({ ...fixtures.start, gameId }),
  shop: [],
  ads: [],
  dryTurns: 0,
});

describe('GameSessionStore', () => {
  it('returns what was saved', () => {
    const store = new GameSessionStore();
    const session = buildSession('game1');

    store.save(session.state.gameId, session);

    expect(store.get(session.state.gameId)).toBe(session);
  });

  it('fails for a game it does not know', () => {
    const store = new GameSessionStore();

    expect(() => store.get(GameIdSchema.parse('nope'))).toThrow(
      'Unknown game nope',
    );
  });

  it('evicts the least recently saved game once full', () => {
    const store = new GameSessionStore();
    const sessions = Array.from({ length: 1001 }, (_, index) =>
      buildSession(`game${index}`),
    );

    sessions.forEach((session) => store.save(session.state.gameId, session));

    expect(() => store.get(GameIdSchema.parse('game0'))).toThrow();
    expect(store.get(GameIdSchema.parse('game1000'))).toBe(sessions[1000]);
  });
});
