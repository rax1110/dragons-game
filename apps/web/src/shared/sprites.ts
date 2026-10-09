import { POTION_ID, type ShopItem } from '@dragons/game-core';

export const TILE = 16;

export type Sheet = { url: string; cell: number; columns: number };

export const SHEETS = {
  tiles: { url: '/sprites/tiles.png', cell: TILE, columns: 8 },
  props: { url: '/sprites/props.png', cell: 80, columns: 6 },
  actors: { url: '/sprites/actors.png', cell: 32, columns: 6 },
} satisfies Record<string, Sheet>;
export type SheetId = keyof typeof SHEETS;
export type Frame = { sheet: SheetId; index: number };

const tile = (index: number): Frame => ({ sheet: 'tiles', index });
const prop = (index: number): Frame => ({ sheet: 'props', index });
const actor = (index: number): Frame => ({ sheet: 'actors', index });

export const GROUND_LEGEND: Record<string, Frame> = {
  '.': tile(0),
  ',': tile(1),
  '*': tile(2),
  '=': tile(3),
  '~': tile(4),
  '`': tile(5),
  '^': tile(6),
};

export const PROPS_LEGEND: Record<string, Frame | null> = {
  '.': null,
  T: prop(0),
  t: prop(1),
  B: prop(2),
  H: prop(4),
  F: prop(5),
  S: prop(6),
  h: prop(7),
  N: prop(8),
  C: prop(9),
  w: prop(10),
};

export const Actors = {
  Trainer: actor(0),
  Merchant: actor(1),
} as const;

export const Icons = {
  Gold: tile(21),
  Coin: tile(7),
  Chest: tile(8),
  Skull: tile(20),
  Sign: tile(22),
  Potion: tile(9),
} as const;

const DRAGON_TIERS = [actor(2), actor(3), actor(4), actor(5)];
const LEVELS_PER_TIER = 3;

export const deriveDragonFrame = (level: number) =>
  DRAGON_TIERS[
    Math.min(DRAGON_TIERS.length - 1, Math.floor(level / LEVELS_PER_TIER))
  ];

const ITEM_FRAMES = new Map([
  [POTION_ID, Icons.Potion],
  ['cs', tile(10)],
  ['ch', tile(11)],
  ['gas', tile(12)],
  ['rf', tile(13)],
  ['wax', tile(14)],
  ['iron', tile(15)],
  ['tricks', tile(16)],
  ['mtrix', tile(17)],
  ['wingpot', tile(18)],
  ['wingpotmax', tile(19)],
]);

export const deriveItemFrame = (item: ShopItem) =>
  ITEM_FRAMES.get(item.id) ?? Icons.Chest;
