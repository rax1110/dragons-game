import { describe, expect, it } from 'vitest';
import {
  buildPath,
  deriveScale,
  GROUND,
  MERCHANT,
  PROPS,
  ROOST,
  SITES,
  deriveSite,
  toPixels,
  type Point,
} from './map.ts';

const locations = [ROOST, MERCHANT, ...SITES];
const isFree = ({ x, y }: Point) => PROPS[y][x] === null;

describe('map', () => {
  it('describes every cell with a legend entry', () => {
    for (const row of [...GROUND, ...PROPS])
      expect(row).toHaveLength(GROUND[0].length);
    expect([...GROUND.flat(), ...PROPS.flat()]).not.toContain(undefined);
  });

  it('keeps every walk between locations on prop-free cells', () => {
    const cells = locations.flatMap((from) =>
      locations.flatMap((to) => buildPath(from, to)),
    );

    expect(cells.every(isFree)).toBe(true);
  });

  it('walks along the street and then up to the board', () => {
    expect(buildPath(ROOST, SITES[0])).toEqual([
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
      { x: 5, y: 6 },
      { x: 5, y: 5 },
    ]);
  });

  it('stays put when the destination is the current cell', () => {
    expect(buildPath(MERCHANT, MERCHANT)).toEqual([MERCHANT]);
  });

  it('sends different quests to different sites', () => {
    const sites = new Set(['a1', 'b2', 'c3', 'd4', 'e5'].map(deriveSite));

    expect(sites.size).toBeGreaterThan(1);
  });

  it('places feet on the bottom centre of a tile', () => {
    expect(toPixels({ x: 5, y: 5 })).toEqual({ x: 88, y: 96 });
  });

  it('picks the largest whole number of device pixels per texel', () => {
    const sizes: [number, number][] = [
      [328, 328],
      [736, 736],
      [100, 100],
      [5000, 5000],
      [1000, 500],
    ];

    expect(sizes.map(([w, h]) => deriveScale(w, h, 1))).toEqual([
      2, 4, 1, 4, 3,
    ]);
    expect(deriveScale(400, 400, 1.25)).toBe(2.4);
  });
});
