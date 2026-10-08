import { describe, expect, it } from 'vitest';
import {
  deriveSuccessRate,
  PROBABILITY_TIERS,
  UNKNOWN_SUCCESS_RATE,
} from './probability.ts';

describe('deriveSuccessRate', () => {
  it('returns the rate of a known label', () => {
    expect(deriveSuccessRate('Piece of cake')).toBe(0.85);
  });

  it('gives unknown labels a low but non-zero rate', () => {
    expect(deriveSuccessRate('Hmmm')).toBe(UNKNOWN_SUCCESS_RATE);
    expect(UNKNOWN_SUCCESS_RATE).toBeGreaterThan(0);
  });

  it('lists tiers from safest to deadliest', () => {
    const rates = [...PROBABILITY_TIERS.values()];

    expect(rates).toEqual(rates.toSorted((a, b) => b - a));
  });
});
