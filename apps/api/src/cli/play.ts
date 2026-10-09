import {
  ActionType,
  play,
  type GameState,
  type TurnEvent,
} from '@dragons/game-core';
import { NestFactory } from '@nestjs/core';
import { GameModule } from '../game/game.module.ts';
import { UpstreamClient } from '../game/upstream.client.ts';

const TARGET_SCORE = 1000;

const formatMove = ({ move }: TurnEvent) =>
  move.type === ActionType.Solve
    ? `solve ${move.ad.probability}: ${move.ad.message}`
    : `buy ${move.item.name}`;

const formatTurn = (event: TurnEvent) => {
  const { state, message } = event;
  const status = `score ${state.score} gold ${state.gold} lives ${state.lives} level ${state.level}`;

  return `turn ${state.turn} | ${formatMove(event)} | ${message} | ${status}`;
};

const formatSummary = (final: GameState, reachedAt: number | null) => {
  const target = reachedAt
    ? `reached ${TARGET_SCORE} at turn ${reachedAt}`
    : `did not reach ${TARGET_SCORE}`;

  return `Game ${final.gameId} over after ${final.turn} turns: score ${final.score}, level ${final.level} (${target})`;
};

const context = await NestFactory.createApplicationContext(GameModule, {
  logger: ['error', 'warn'],
});
const api = context.get(UpstreamClient);
const start = await api.createGame();

let final = start;
let reachedAt: number | null = null;

for await (const event of play(api, start)) {
  final = event.state;

  if (!reachedAt && final.score >= TARGET_SCORE) reachedAt = final.turn;

  console.log(formatTurn(event));
}

console.log(formatSummary(final, reachedAt));

await context.close();

process.exitCode = reachedAt ? 0 : 1;
