import {
  canContinue,
  type GameState,
  type TurnEvent,
} from '@dragons/game-core';
import { selectLastEvent, type GameStore } from '../game/game-store.ts';

export const CueKind = {
  Arrive: 'arrive',
  Turn: 'turn',
  Rest: 'rest',
} as const;

export type Cue =
  | { kind: typeof CueKind.Arrive; state: GameState }
  | { kind: typeof CueKind.Turn; event: TurnEvent }
  | { kind: typeof CueKind.Rest };

export const deriveCue = (prev: GameStore, next: GameStore): Cue | null => {
  if (!next.state) return null;
  if (!prev.state || prev.gameId !== next.gameId)
    return { kind: CueKind.Arrive, state: next.state };

  const event = selectLastEvent(next);

  if (event && event !== selectLastEvent(prev))
    return { kind: CueKind.Turn, event };

  if (!canContinue(next.state) && canContinue(prev.state))
    return { kind: CueKind.Rest };

  return null;
};
