import { describe, expect, it } from 'vitest';
import { SHEETS } from '../../shared/sprites.ts';
import { buildAtlasData } from './atlas.ts';

describe('buildAtlasData', () => {
  it('cuts a packed sheet into row-major frames', () => {
    const { frames } = buildAtlasData(SHEETS.tiles, 48);

    expect(Object.keys(frames)).toHaveLength(24);
    expect(frames[13].frame).toEqual({ x: 80, y: 16, w: 16, h: 16 });
  });
});
