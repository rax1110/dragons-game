import {
  Application,
  Assets,
  Spritesheet,
  TextureStyle,
  type Texture,
} from 'pixi.js';
import { SHEETS, type Sheet } from '../../shared/sprites.ts';
import { buildAtlasData } from './atlas.ts';
import { createDirector, type Store } from './director.ts';
import { deriveScale, MAP_HEIGHT, MAP_WIDTH } from './map.ts';
import { buildStage, type Sheets } from './stage.ts';

export type WorldOptions = { host: HTMLElement; store: Store };
export type World = { destroy: () => void };

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const WORLD_LABEL = 'Town of Mugloar';
const GRASS = 0x3abe41;

TextureStyle.defaultOptions.scaleMode = 'nearest';

const loadSheet = async (sheet: Sheet) => {
  const texture = await Assets.load<Texture>(sheet.url);
  const spritesheet = new Spritesheet({
    texture,
    data: buildAtlasData(sheet, texture.height),
  });

  spritesheet.parseSync();

  return spritesheet;
};

const buildSheets = async (): Promise<Sheets> => {
  const [tiles, props, actors] = await Promise.all([
    loadSheet(SHEETS.tiles),
    loadSheet(SHEETS.props),
    loadSheet(SHEETS.actors),
  ]);

  return { tiles, props, actors };
};

let loading: Promise<Sheets> | null = null;

export const loadSheets = () => (loading ??= buildSheets());

export const createWorld = async ({
  host,
  store,
}: WorldOptions): Promise<World> => {
  const sheets = await loadSheets();
  const app = new Application();

  await app.init({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    background: GRASS,
    roundPixels: true,
  });

  const stage = buildStage(app, sheets);
  const reducedMotion = matchMedia(REDUCED_MOTION_QUERY).matches;
  const director = createDirector(stage, store, reducedMotion);
  const fit = () => {
    const scale = deriveScale(
      host.clientWidth,
      host.clientHeight,
      devicePixelRatio,
    );

    app.canvas.style.width = `${MAP_WIDTH * scale}px`;
    app.canvas.style.height = `${MAP_HEIGHT * scale}px`;
  };
  const observer = new ResizeObserver(fit);

  observer.observe(host);
  app.canvas.setAttribute('role', 'img');
  app.canvas.setAttribute('aria-label', WORLD_LABEL);
  app.canvas.setAttribute('data-panel', '');
  host.append(app.canvas);

  return {
    destroy: () => {
      observer.disconnect();
      director.destroy();
      app.destroy({ removeView: true }, { children: true });
    },
  };
};
