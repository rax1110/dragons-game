import type { BuyResult, GameState, SolveResult } from './game-api.ts';

export const applySolve = (
  state: GameState,
  result: SolveResult,
): GameState => ({
  ...state,
  lives: result.lives,
  gold: result.gold,
  score: result.score,
  turn: result.turn,
});

export const applyBuy = (state: GameState, result: BuyResult): GameState => ({
  ...state,
  lives: result.lives,
  gold: result.gold,
  level: result.level,
  turn: result.turn,
});
