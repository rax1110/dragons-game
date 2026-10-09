import {
  Container,
  Graphics,
  Sprite,
  type Application,
  type Spritesheet,
  type Texture,
} from 'pixi.js';
import {
  Actors,
  deriveDragonFrame,
  Icons,
  TILE,
  type Frame,
  type SheetId,
} from '../../shared/sprites.ts';
import {
  GROUND,
  MERCHANT_STAND,
  NEST,
  PROPS,
  ROOST,
  toPixels,
  type Point,
} from './map.ts';

export type Sheets = Record<SheetId, Spritesheet>;
export type Actor = {
  root: Container;
  body: Container;
  sprite: Sprite;
  shadow: Graphics;
};
export type Stage = {
  camera: Container;
  actors: { trainer: Actor; dragon: Actor; merchant: Actor };
  coins: Sprite[];
  item: Sprite;
  sheets: Sheets;
};

export const SHADOW_ALPHA = 0.3;
export const COIN_SPREAD = [-14, -10, -6, -2, 2, 6, 10, 14];
const FEET = { x: 0.5, y: 1 };
const CORNER = { x: 0, y: 1 };

export const frameOf = (sheets: Sheets, { sheet, index }: Frame): Texture =>
  sheets[sheet].textures[index];

const buildGround = (sheets: Sheets) =>
  GROUND.flatMap((row, y) =>
    row.map(
      (frame, x) =>
        new Sprite({
          texture: frameOf(sheets, frame),
          x: x * TILE,
          y: y * TILE,
        }),
    ),
  );

const buildProps = (sheets: Sheets) =>
  PROPS.flatMap((row, y) =>
    row.flatMap((frame, x) => {
      if (!frame) return [];

      const foot = (y + 1) * TILE;

      return [
        new Sprite({
          texture: frameOf(sheets, frame),
          anchor: CORNER,
          x: x * TILE,
          y: foot,
          zIndex: foot,
        }),
      ];
    }),
  );

const createActor = (texture: Texture, at: Point): Actor => {
  const shadow = new Graphics()
    .ellipse(0, 0, 6, 2.5)
    .fill({ color: 0x000000, alpha: SHADOW_ALPHA });
  const sprite = new Sprite({ texture, anchor: FEET });
  const body = new Container({ children: [sprite] });
  const root = new Container({
    children: [shadow, body],
    position: toPixels(at),
  });

  return { root, body, sprite, shadow };
};

const createFx = (texture: Texture) =>
  new Sprite({ texture, anchor: 0.5, visible: false });

export const buildStage = (app: Application, sheets: Sheets): Stage => {
  const actors = {
    trainer: createActor(frameOf(sheets, Actors.Trainer), ROOST),
    dragon: createActor(frameOf(sheets, deriveDragonFrame(0)), NEST),
    merchant: createActor(frameOf(sheets, Actors.Merchant), MERCHANT_STAND),
  };
  const cast = Object.values(actors);
  const scene = new Container({
    children: [...buildProps(sheets), ...cast.map((actor) => actor.root)],
    sortableChildren: true,
  });
  const coins = COIN_SPREAD.map(() => createFx(frameOf(sheets, Icons.Coin)));
  const item = createFx(frameOf(sheets, Icons.Chest));
  const camera = new Container({
    children: [
      new Container({ isRenderGroup: true, children: buildGround(sheets) }),
      scene,
      new Container({ children: [...coins, item] }),
    ],
  });

  app.stage.addChild(camera);
  app.ticker.add(() => {
    for (const { root } of cast) root.zIndex = root.y;
  });

  return { camera, actors, coins, item, sheets };
};
