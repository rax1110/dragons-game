import { describe, expect, it } from 'vitest';
import { AdIdSchema, Encoding, type Ad } from '../contract/game-api.ts';
import { rankAds } from './ranking.ts';

const buildAd = (adId: string, overrides: Partial<Ad> = {}): Ad => ({
  adId: AdIdSchema.parse(adId),
  message: 'Help Otar Crawford to fix their weed',
  reward: 100,
  expiresIn: 5,
  probability: 'Sure thing',
  encoding: Encoding.Plain,
  ...overrides,
});

describe('rankAds', () => {
  it('ranks viable ads by expected value and recommends only the first', () => {
    const ranked = rankAds(
      [
        buildAd('small', { reward: 10 }),
        buildAd('big', { reward: 100, probability: 'Quite likely' }),
      ],
      3,
    );

    expect(ranked.map((ad) => [ad.adId, ad.recommended])).toEqual([
      ['big', true],
      ['small', false],
    ]);
  });

  it('never recommends an ad that harms reputation, even a sure thing', () => {
    const [first] = rankAds(
      [
        buildAd('theft', {
          message:
            'Steal turnips delivery to Zdenka Braddock and share some of the profits with the people.',
        }),
      ],
      3,
    );

    expect(first).toMatchObject({
      harmful: true,
      viable: false,
      recommended: false,
    });
  });

  it('treats stealth as harmless', () => {
    const [first] = rankAds(
      [
        buildAd('sneaky', {
          message: 'Help Ambre Constable with a stealthy delivery',
        }),
      ],
      3,
    );

    expect(first?.harmful).toBe(false);
  });

  it('puts viable ads before dangerous ones and orders the dangerous by success rate', () => {
    const ranked = rankAds(
      [
        buildAd('impossible', { probability: 'Impossible' }),
        buildAd('gamble', { probability: 'Gamble' }),
        buildAd('safe', { probability: 'Piece of cake' }),
        buildAd('risky', { probability: 'Risky' }),
      ],
      3,
    );

    expect(ranked.map((ad) => ad.adId)).toEqual([
      'safe',
      'gamble',
      'risky',
      'impossible',
    ]);
  });

  it('values a life more when lives are low', () => {
    const [atFull] = rankAds([buildAd('x')], 3);
    const [atOne] = rankAds([buildAd('x')], 1);

    expect(atOne?.expectedValue).toBeLessThan(atFull?.expectedValue ?? 0);
  });

  it('breaks ties by expiry, then by id', () => {
    const ranked = rankAds(
      [
        buildAd('b', { expiresIn: 3 }),
        buildAd('a', { expiresIn: 3 }),
        buildAd('c', { expiresIn: 1 }),
      ],
      3,
    );

    expect(ranked.map((ad) => ad.adId)).toEqual(['c', 'a', 'b']);
  });
});
