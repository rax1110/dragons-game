import { describe, expect, it } from 'vitest';
import { rankAds } from '../ads/ranking.ts';
import {
  ActionType,
  AdIdSchema,
  Encoding,
  GameStateSchema,
  ShopSchema,
  type Ad,
  type GameState,
} from '../contract/game-api.ts';
import { fixtures } from '../fixtures.ts';
import { POTION_ID } from '../shop/catalog.ts';
import { decide } from './decide.ts';
import { POLICY } from './policy.ts';

const shop = ShopSchema.parse(fixtures.shop);

const buildState = (overrides: Partial<GameState> = {}): GameState =>
  GameStateSchema.parse({
    gameId: 'game',
    lives: 3,
    gold: 0,
    level: 0,
    score: 0,
    turn: 0,
    ...overrides,
  });

const buildAd = (probability: string): Ad => ({
  adId: AdIdSchema.parse(probability.replaceAll(/\W/g, '')),
  message: 'Help Otar Crawford to fix their weed',
  reward: 50,
  expiresIn: 5,
  probability,
  encoding: Encoding.Plain,
});

const viable = rankAds([buildAd('Sure thing')], 3);
const hopeless = rankAds(
  [buildAd('Impossible'), buildAd('Suicide mission')],
  3,
);

describe('decide', () => {
  it('heals when lives are below target and a potion is affordable', () => {
    expect(
      decide(buildState({ lives: 2, gold: 60 }), viable, shop, 0),
    ).toMatchObject({
      type: ActionType.Buy,
      item: { id: POTION_ID },
    });
  });

  it('heals before upgrading', () => {
    expect(
      decide(buildState({ lives: 2, gold: 500 }), viable, shop, 0),
    ).toMatchObject({
      item: { id: POTION_ID },
    });
  });

  it('upgrades the dragon when healthy and a potion stays affordable afterwards', () => {
    expect(decide(buildState({ gold: 150 }), viable, shop, 0)).toMatchObject({
      type: ActionType.Buy,
      item: { id: 'cs' },
    });
  });

  it('keeps gold for a potion instead of upgrading', () => {
    expect(decide(buildState({ gold: 120 }), viable, shop, 0)).toMatchObject({
      type: ActionType.Solve,
    });
  });

  it('stops upgrading at the level cap', () => {
    expect(
      decide(
        buildState({ gold: 500, level: POLICY.maxLevel }),
        viable,
        shop,
        0,
      ),
    ).toMatchObject({ type: ActionType.Solve });
  });

  it('solves the recommended ad when there is nothing worth buying', () => {
    expect(decide(buildState({ gold: 30 }), viable, shop, 0)).toEqual({
      type: ActionType.Solve,
      ad: viable[0],
    });
  });

  it('passes the turn with a potion when no ad is viable', () => {
    expect(decide(buildState({ gold: 60 }), hopeless, shop, 0)).toMatchObject({
      item: { id: POTION_ID },
    });
  });

  it('solves the least bad ad when no ad is viable and nothing is affordable', () => {
    expect(decide(buildState({ gold: 10 }), hopeless, shop, 0)).toMatchObject({
      type: ActionType.Solve,
      ad: { probability: 'Suicide mission' },
    });
  });

  it('stops buying upgrades and passes once the pool has been hopeless for a while', () => {
    expect(
      decide(buildState({ gold: 1000 }), hopeless, shop, POLICY.hopelessAfter),
    ).toMatchObject({ type: ActionType.Solve });
  });

  it('keeps healing while the pool is hopeless', () => {
    expect(
      decide(
        buildState({ lives: 1, gold: 1000 }),
        hopeless,
        shop,
        POLICY.hopelessAfter,
      ),
    ).toMatchObject({ item: { id: POTION_ID } });
  });

  it('stops when there is nothing to do', () => {
    expect(decide(buildState(), [], shop, 0)).toEqual({
      type: ActionType.Stop,
    });
  });
});
