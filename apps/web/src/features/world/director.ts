import {
  ActionType,
  canContinue,
  getLevelsGained,
  type GameState,
  type ShopItem,
  type TurnEvent,
} from '@dragons/game-core';
import { gsap } from 'gsap/gsap-core';
import type { StoreApi } from 'zustand';
import { deriveDragonFrame, deriveItemFrame } from '../../shared/sprites.ts';
import type { GameStore } from '../game/game-store.ts';
import {
  appear,
  burstCoins,
  flashHurt,
  flyTo,
  land,
  levelUp,
  raiseItem,
  reset,
  rest,
  shake,
  startAmbient,
  takeOff,
  walkTo,
} from './animations.ts';
import { CueKind, deriveCue, type Cue } from './cues.ts';
import {
  buildPath,
  deriveSite,
  MERCHANT,
  MERCHANT_STAND,
  NEST,
  ROOST,
  type Point,
} from './map.ts';
import { frameOf, type Stage } from './stage.ts';

export type Store = Pick<StoreApi<GameStore>, 'getState' | 'subscribe'>;

export const createDirector = (
  stage: Stage,
  store: Store,
  reducedMotion: boolean,
) => {
  const { trainer, dragon, merchant } = stage.actors;
  const ambient = reducedMotion
    ? null
    : startAmbient([trainer, dragon, merchant]);

  let trainerAt = ROOST;
  let waiting: Cue | null = null;
  let current: ReturnType<typeof gsap.timeline> | null = null;

  const dragonTexture = (level: number) =>
    frameOf(stage.sheets, deriveDragonFrame(level));

  const walk = (to: Point) => {
    const path = buildPath(trainerAt, to);

    trainerAt = to;

    return walkTo(trainer, path);
  };

  const sequenceArrive = (state: GameState) => {
    trainerAt = ROOST;
    dragon.sprite.texture = dragonTexture(state.level);
    reset(trainer, ROOST);
    reset(dragon, NEST);
    reset(merchant, MERCHANT_STAND);

    const timeline = gsap
      .timeline()
      .add(appear(merchant))
      .add(appear(trainer), '<0.1')
      .add(appear(dragon), '<0.1');

    return canContinue(state)
      ? timeline
      : timeline.add(rest(dragon)).progress(1);
  };

  const sequenceMission = (site: Point, succeeded: boolean) => {
    const outcome = succeeded
      ? burstCoins(stage.coins, site)
      : gsap.timeline().add(flashHurt(dragon)).add(shake(stage.camera), '<');

    return gsap
      .timeline()
      .add(walk(site))
      .add(takeOff(dragon), '<0.1')
      .add(flyTo(dragon, site))
      .add(outcome)
      .add(flyTo(dragon, NEST))
      .add(land(dragon));
  };

  const sequencePurchase = (
    item: ShopItem,
    succeeded: boolean,
    level: number,
  ) => {
    const timeline = gsap.timeline().add(walk(MERCHANT));

    if (!succeeded) return timeline;

    timeline.add(
      raiseItem(stage.item, frameOf(stage.sheets, deriveItemFrame(item))),
    );

    return getLevelsGained(item) > 0
      ? timeline.add(levelUp(dragon, dragonTexture(level)), '<0.2')
      : timeline;
  };

  const sequenceTurn = ({ move, succeeded, state }: TurnEvent) => {
    const timeline =
      move.type === ActionType.Solve
        ? sequenceMission(deriveSite(move.ad.adId), succeeded)
        : sequencePurchase(move.item, succeeded, state.level);

    return canContinue(state) ? timeline : timeline.add(rest(dragon));
  };

  const buildSequence = (cue: Cue) => {
    switch (cue.kind) {
      case CueKind.Arrive:
        return sequenceArrive(cue.state);
      case CueKind.Turn:
        return sequenceTurn(cue.event);
      case CueKind.Rest:
        return gsap.timeline().add(flashHurt(dragon)).add(rest(dragon));
    }
  };

  const drain = async () => {
    if (current) return;

    while (waiting) {
      const cue = waiting;

      waiting = null;
      current = buildSequence(cue);

      if (reducedMotion) current.progress(1);

      await current.then();
    }

    current = null;
  };

  const enqueue = (cue: Cue) => {
    waiting = cue;

    void drain();
  };

  const unsubscribe = store.subscribe((next, prev) => {
    const cue = deriveCue(prev, next);

    if (cue) enqueue(cue);
  });
  const { state } = store.getState();

  if (state) enqueue({ kind: CueKind.Arrive, state });

  return {
    destroy: () => {
      unsubscribe();
      waiting = null;
      current?.kill();
      ambient?.kill();
    },
  };
};
