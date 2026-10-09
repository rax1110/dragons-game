import { describe, expect, it } from 'vitest';
import { Encoding } from '../contract/game-api.ts';
import { fixtures } from '../fixtures.ts';
import { decodeAd, decodeAds } from './decode.ts';

describe('decodeAd', () => {
  it('keeps plain ads as they are', () => {
    expect(decodeAd(fixtures.plainAd)).toEqual({
      adId: 'cx6vhNAH',
      message: 'Help Otar Crawford to fix their weed',
      reward: 8,
      expiresIn: 5,
      probability: 'Sure thing',
      encoding: Encoding.Plain,
    });
  });

  it('decodes base64 ads', () => {
    expect(decodeAd(fixtures.base64Ad)).toEqual({
      adId: 'fUz5K6BS',
      message: 'Infiltrate The Ivory Alligator Gang and recover their secrets.',
      reward: 153,
      expiresIn: 2,
      probability: 'Playing with fire',
      encoding: Encoding.Base64,
    });
  });

  it('decodes rot13 ads', () => {
    expect(decodeAd(fixtures.rot13Ad)).toMatchObject({
      adId: 'cx6vhNAH',
      message: 'Help Otar Crawford to fix their weed',
      probability: 'Sure thing',
      encoding: Encoding.Rot13,
    });
  });

  it('drops ads with an unknown encoding', () => {
    expect(decodeAd({ ...fixtures.plainAd, encrypted: 3 })).toBeNull();
  });

  it('drops ads whose payload is not valid base64', () => {
    expect(decodeAd({ ...fixtures.base64Ad, message: '%%%' })).toBeNull();
  });

  it('drops ads whose id is not a safe identifier', () => {
    expect(decodeAd({ ...fixtures.plainAd, adId: '../start' })).toBeNull();
  });
});

describe('decodeAds', () => {
  it('skips what it cannot decode', () => {
    const ads = decodeAds([
      fixtures.plainAd,
      { ...fixtures.plainAd, encrypted: 3 },
      fixtures.base64Ad,
    ]);

    expect(ads.map((ad) => ad.adId)).toEqual(['cx6vhNAH', 'fUz5K6BS']);
  });
});
