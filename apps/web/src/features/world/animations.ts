import { gsap } from 'gsap/gsap-core';
import type { Container, Sprite, Texture } from 'pixi.js';
import { NEST, toPixels, type Point } from './map.ts';
import { COIN_SPREAD, SHADOW_ALPHA, type Actor } from './stage.ts';

const STEP_SECONDS = 0.12;
const FLAP_SECONDS = 0.12;
const FLIGHT_SECONDS = 0.5;
const FLAPS = Math.round(FLIGHT_SECONDS / FLAP_SECONDS);
const FLIGHT_ALTITUDE = 24;
const SHAKE_STRENGTH = 1;
const COIN_STAGGER = 0.03;
const NEST_PIXELS = toPixels(NEST);
const Tint = {
  White: 0xffffff,
  Hurt: 0xff6b6b,
  Glow: 0xfff2a0,
  Rest: 0x8a8a8a,
} as const;

const faceTowards = (actor: Actor, x: number) => {
  actor.body.scale.x = Math.sign(x - actor.root.x) || actor.body.scale.x;
};

export const reset = (actor: Actor, at: Point) => {
  Object.assign(actor.root, { ...toPixels(at), alpha: 0 });
  Object.assign(actor.body, { y: 0, rotation: 0 });
  Object.assign(actor.sprite, { y: 0, tint: Tint.White });
  actor.shadow.alpha = SHADOW_ALPHA;
  for (const node of [actor.root, actor.body, actor.shadow]) node.scale.set(1);
};

export const appear = (actor: Actor) =>
  gsap
    .timeline()
    .set(actor.body.scale, { y: 0.6 })
    .to(actor.root, { alpha: 1, duration: 0.2 })
    .to(actor.body.scale, { y: 1, duration: 0.4, ease: 'back.out(2)' }, 0);

export const walkTo = (actor: Actor, path: Point[]) => {
  const steps = path.slice(1).map(toPixels);
  const walk = steps.reduce(
    (timeline, point) =>
      timeline.to(actor.root, {
        ...point,
        duration: STEP_SECONDS,
        ease: 'none',
        onStart: () => faceTowards(actor, point.x),
      }),
    gsap.timeline(),
  );

  if (steps.length === 0) return walk;

  return walk
    .to(
      actor.sprite,
      {
        y: -2,
        duration: STEP_SECONDS / 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: steps.length * 2 - 1,
      },
      0,
    )
    .fromTo(
      actor.body,
      { rotation: -0.08 },
      {
        rotation: 0.08,
        duration: STEP_SECONDS,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: steps.length - 1,
      },
      0,
    )
    .set(actor.body, { rotation: 0 });
};

export const takeOff = (actor: Actor) =>
  gsap
    .timeline()
    .to(actor.body.scale, {
      keyframes: [
        { y: 0.8, duration: 0.1 },
        { y: 1.15, duration: 0.1 },
        { y: 1, duration: 0.1 },
      ],
    })
    .to(
      actor.body,
      { y: -FLIGHT_ALTITUDE, duration: 0.3, ease: 'power2.out' },
      0.1,
    )
    .to(actor.shadow, { alpha: 0.12, duration: 0.3 }, 0.1)
    .to(actor.shadow.scale, { x: 0.6, y: 0.6, duration: 0.3 }, 0.1);

export const flyTo = (actor: Actor, to: Point) => {
  const target = toPixels(to);

  return gsap
    .timeline()
    .to(actor.root, {
      ...target,
      duration: FLIGHT_SECONDS,
      ease: 'power1.inOut',
      onStart: () => faceTowards(actor, target.x),
    })
    .to(
      actor.body.scale,
      {
        y: 0.85,
        duration: FLAP_SECONDS / 2,
        yoyo: true,
        repeat: FLAPS * 2 - 1,
        ease: 'sine.inOut',
      },
      0,
    );
};

export const land = (actor: Actor) =>
  gsap
    .timeline()
    .to(actor.body, { y: 0, duration: 0.25, ease: 'power2.in' })
    .to(actor.shadow, { alpha: SHADOW_ALPHA, duration: 0.25 }, 0)
    .to(actor.shadow.scale, { x: 1, y: 1, duration: 0.25 }, 0)
    .to(actor.body.scale, {
      keyframes: [
        { y: 0.85, duration: 0.08 },
        { y: 1, duration: 0.12 },
      ],
    });

export const flashHurt = (actor: Actor) =>
  gsap
    .timeline({ repeat: 2 })
    .set(actor.sprite, { tint: Tint.Hurt }, 0)
    .set(actor.sprite, { tint: Tint.White }, 0.1);

export const shake = (camera: Container) =>
  gsap
    .timeline()
    .to(camera, {
      x: SHAKE_STRENGTH,
      duration: 0.04,
      yoyo: true,
      repeat: 5,
      ease: 'none',
    })
    .set(camera, { x: 0 });

export const burstCoins = (coins: Sprite[], at: Point) => {
  const { x, y } = toPixels(at);

  return gsap
    .timeline()
    .set(coins, { x, y: y - 8, alpha: 1, visible: true, stagger: COIN_STAGGER })
    .to(
      coins,
      {
        x: (index: number) => x + COIN_SPREAD[index],
        y: y - 28,
        duration: 0.3,
        ease: 'power2.out',
        stagger: COIN_STAGGER,
      },
      0,
    )
    .to(
      coins,
      {
        y: y - 4,
        alpha: 0,
        duration: 0.3,
        ease: 'power2.in',
        stagger: COIN_STAGGER,
      },
      0.3,
    )
    .set(coins, { visible: false, stagger: COIN_STAGGER }, 0.6);
};

export const raiseItem = (icon: Sprite, texture: Texture) =>
  gsap
    .timeline()
    .call(() => {
      icon.texture = texture;
    })
    .set(icon, {
      x: NEST_PIXELS.x,
      y: NEST_PIXELS.y - 20,
      alpha: 1,
      visible: true,
    })
    .to(icon, { y: NEST_PIXELS.y - 36, duration: 0.6, ease: 'power1.out' })
    .to(icon, { alpha: 0, duration: 0.3 }, 0.3)
    .set(icon, { visible: false });

export const levelUp = (actor: Actor, texture: Texture) =>
  gsap
    .timeline()
    .set(actor.sprite, { tint: Tint.Glow })
    .to(actor.root.scale, {
      x: 1.3,
      y: 1.3,
      duration: 0.25,
      ease: 'back.out(3)',
    })
    .call(() => {
      actor.sprite.texture = texture;
    })
    .to(actor.root.scale, { x: 1, y: 1, duration: 0.25, ease: 'power2.out' })
    .set(actor.sprite, { tint: Tint.White });

export const rest = (actor: Actor) =>
  gsap
    .timeline()
    .to(actor.body, {
      rotation: Math.PI / 2,
      duration: 0.5,
      ease: 'bounce.out',
    })
    .to(actor.shadow.scale, { x: 1.6, duration: 0.3 }, 0)
    .set(actor.sprite, { tint: Tint.Rest });

export const startAmbient = (actors: Actor[]) =>
  gsap.to(
    actors.map((actor) => actor.sprite.scale),
    {
      y: 1.04,
      duration: 1.2,
      stagger: 0.4,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    },
  );
