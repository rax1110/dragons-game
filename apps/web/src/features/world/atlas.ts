import type { SpritesheetData } from 'pixi.js';
import type { Sheet } from '../../shared/sprites.ts';

export const buildAtlasData = (
  { cell, columns }: Sheet,
  height: number,
): SpritesheetData => {
  const rows = height / cell;
  const frames = Object.fromEntries(
    Array.from({ length: columns * rows }, (_, index) => [
      index,
      {
        frame: {
          x: (index % columns) * cell,
          y: Math.floor(index / columns) * cell,
          w: cell,
          h: cell,
        },
      },
    ]),
  );

  return { frames, meta: { scale: 1 } };
};
