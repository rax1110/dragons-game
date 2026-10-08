import type { Ad } from './game-api.ts';
import { POLICY } from './policy.ts';
import { deriveSuccessRate } from './probability.ts';

const HARMFUL = /\bsteal\b|share some of the profits|\bkill\b|take the blame/i;

export type RankedAd = Ad & {
  successRate: number;
  expectedValue: number;
  harmful: boolean;
  viable: boolean;
  recommended: boolean;
};

type AssessedAd = Omit<RankedAd, 'recommended'>;

const deriveLifeValue = (lives: number) =>
  POLICY.lifeValue *
  (POLICY.targetLives + 1 - Math.min(lives, POLICY.targetLives));

const assessAd = (ad: Ad, lives: number): AssessedAd => {
  const successRate = deriveSuccessRate(ad.probability);
  const harmful = HARMFUL.test(ad.message);

  return {
    ...ad,
    successRate,
    harmful,
    viable: !harmful && successRate >= POLICY.minSuccessRate,
    expectedValue:
      successRate * ad.reward - (1 - successRate) * deriveLifeValue(lives),
  };
};

const compareByValue = (a: AssessedAd, b: AssessedAd) =>
  b.expectedValue - a.expectedValue;
const compareBySafety = (a: AssessedAd, b: AssessedAd) =>
  b.successRate - a.successRate;

const compareByPreference = (a: AssessedAd, b: AssessedAd) => {
  const viability = Number(b.viable) - Number(a.viable);
  const merit = a.viable ? compareByValue(a, b) : compareBySafety(a, b);
  const urgency = a.expiresIn - b.expiresIn;

  return viability || merit || urgency || a.adId.localeCompare(b.adId);
};

export const rankAds = (ads: readonly Ad[], lives: number): RankedAd[] =>
  ads
    .map((ad) => assessAd(ad, lives))
    .toSorted(compareByPreference)
    .map((ad, index) => ({ ...ad, recommended: index === 0 && ad.viable }));
