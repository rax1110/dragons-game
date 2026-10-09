import { useEffect, useRef } from 'react';
import { useGameStore } from '../game/game-store.ts';
import styles from './world.module.css';

const loadWorld = () => import('./create-world.ts');

const giveUp = (error: unknown) => {
  console.warn('The town could not be drawn', error);

  return null;
};

export const preloadWorld = () =>
  loadWorld()
    .then((world) => world.loadSheets())
    .catch(giveUp);

export const showTown = () => window.scrollTo({ top: 0 });

export const WorldView = () => {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;

    if (!element) return;

    const ready = loadWorld()
      .then((world) =>
        world.createWorld({ host: element, store: useGameStore }),
      )
      .catch(giveUp);

    return () => {
      void ready.then((world) => world?.destroy());
    };
  }, []);

  return <div ref={host} className={styles.world} />;
};
