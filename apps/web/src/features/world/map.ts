import { GROUND_LEGEND, PROPS_LEGEND, TILE } from '../../shared/sprites.ts';

export type Point = { x: number; y: number };

const MAX_SCALE = 4;
const STREET_ROW = 7;

const GROUND_ROWS = [
  '..........',
  '..........',
  '..........',
  '..........',
  '..........',
  '..=..=..=.',
  ',.=..=..=*',
  '..=======.',
  '*...=..=`^',
  '.,.....`~~',
];

const PROPS_ROWS = [
  '..........',
  '.....t....',
  '..........',
  '..........',
  'H....S.F..',
  '.........B',
  'B..T..T..h',
  '..........',
  '.N........',
  '..T.w.C...',
];

const buildLayer = <Cell>(rows: string[], legend: Record<string, Cell>) =>
  rows.map((row) => [...row].map((char) => legend[char]));

export const GROUND = buildLayer(GROUND_ROWS, GROUND_LEGEND);
export const PROPS = buildLayer(PROPS_ROWS, PROPS_LEGEND);
export const MAP_WIDTH = GROUND[0].length * TILE;
export const MAP_HEIGHT = GROUND.length * TILE;

export const ROOST: Point = { x: 2, y: 7 };
export const NEST: Point = { x: 1, y: 8 };
export const MERCHANT: Point = { x: 8, y: 7 };
export const MERCHANT_STAND: Point = { x: 9, y: 7 };
export const SITES: Point[] = [
  { x: 5, y: 5 },
  { x: 2, y: 5 },
  { x: 8, y: 5 },
  { x: 4, y: 8 },
  { x: 7, y: 8 },
];

export const deriveSite = (adId: string) =>
  SITES[
    [...adId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % SITES.length
  ];

const range = (from: number, to: number) => {
  const step = Math.sign(to - from);

  return Array.from(
    { length: Math.abs(to - from) + 1 },
    (_, index) => from + index * step,
  );
};

export const buildPath = (from: Point, to: Point): Point[] => [
  ...range(from.y, STREET_ROW).map((y) => ({ x: from.x, y })),
  ...range(from.x, to.x)
    .slice(1)
    .map((x) => ({ x, y: STREET_ROW })),
  ...range(STREET_ROW, to.y)
    .slice(1)
    .map((y) => ({ x: to.x, y })),
];

export const toPixels = (point: Point): Point => ({
  x: (point.x + 0.5) * TILE,
  y: (point.y + 1) * TILE,
});

export const deriveScale = (width: number, height: number, density: number) =>
  Math.max(
    1,
    Math.min(
      Math.floor(MAX_SCALE * density),
      Math.floor((width * density) / MAP_WIDTH),
      Math.floor((height * density) / MAP_HEIGHT),
    ),
  ) / density;
