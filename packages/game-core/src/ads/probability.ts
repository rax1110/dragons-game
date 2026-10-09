export const PROBABILITY_TIERS = new Map([
  ['Sure thing', 0.95],
  ['Piece of cake', 0.85],
  ['Walk in the park', 0.75],
  ['Quite likely', 0.6],
  ['Hmmm....', 0.5],
  ['Gamble', 0.4],
  ['Risky', 0.35],
  ['Rather detrimental', 0.3],
  ['Playing with fire', 0.2],
  ['Suicide mission', 0.1],
  ['Impossible', 0.02],
]);

export const UNKNOWN_SUCCESS_RATE = 0.3;

export const deriveSuccessRate = (probability: string): number =>
  PROBABILITY_TIERS.get(probability) ?? UNKNOWN_SUCCESS_RATE;
