import {
  ActionType,
  GameStateSchema,
  ShopItemSchema,
  type TurnEvent,
} from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { describe, expect, it } from 'vitest';
import { useGameStore, type GameStore } from '../game/game-store.ts';
import { CueKind, deriveCue } from './cues.ts';

const state = GameStateSchema.parse(fixtures.start);
const event: TurnEvent = {
  move: { type: ActionType.Buy, item: ShopItemSchema.parse(fixtures.shop[0]) },
  state: { ...state, turn: 1 },
  message: 'Bought Healing potion',
  succeeded: true,
};

const build = (data: Partial<GameStore>): GameStore => ({
  ...useGameStore.getInitialState(),
  ...data,
});

const playing = build({ gameId: state.gameId, state });

describe('deriveCue', () => {
  it('arrives when a game starts', () => {
    expect(deriveCue(build({}), playing)).toEqual({
      kind: CueKind.Arrive,
      state,
    });
  });

  it('plays a turn when a new event lands', () => {
    expect(deriveCue(playing, build({ ...playing, events: [event] }))).toEqual({
      kind: CueKind.Turn,
      event,
    });
  });

  it('stays quiet while the latest event is unchanged', () => {
    const withEvent = build({ ...playing, events: [event] });

    expect(deriveCue(withEvent, build({ ...withEvent, ads: [] }))).toBeNull();
  });

  it('rests the dragon when the lives run out without an event', () => {
    const over = build({ ...playing, state: { ...state, lives: 0 } });

    expect(deriveCue(playing, over)).toEqual({ kind: CueKind.Rest });
  });

  it('ignores changes outside a game', () => {
    expect(deriveCue(build({}), build({ error: 'Offline' }))).toBeNull();
  });
});
