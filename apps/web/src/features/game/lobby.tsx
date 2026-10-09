import { useEffect } from 'react';
import { SpriteIcon } from '../../shared/sprite-icon.tsx';
import { Button } from '../../shared/button.tsx';
import { Alert } from '../../shared/note.tsx';
import { deriveDragonFrame, Icons } from '../../shared/sprites.ts';
import { preloadWorld } from '../world/world-view.tsx';
import { selectBusy, useGameStore } from './game-store.ts';
import styles from './lobby.module.css';

const RULES = [
  {
    frame: Icons.Sign,
    text: 'Each quest stays on the board for a few turns. Solving, shopping and investigating take one turn each.',
  },
  {
    frame: Icons.Gold,
    text: 'A solved quest adds its reward to your gold and your score. Shopping spends gold, never score.',
  },
  {
    frame: Icons.Potion,
    text: 'A failed quest costs a life. A potion gives one back, an upgrade makes the quests easier.',
  },
];

export const Lobby = () => {
  const busy = useGameStore(selectBusy);
  const error = useGameStore((store) => store.error);
  const createGame = useGameStore((store) => store.createGame);

  useEffect(() => {
    void preloadWorld();
  }, []);

  return (
    <main className={styles.lobby}>
      <span className={styles.mark}>
        <SpriteIcon
          frame={deriveDragonFrame(0)}
          scale={4}
          label="Your dragon"
        />
      </span>
      <p className={styles.kicker}>Kingdom of Mugloar</p>
      <h1 className={styles.title}>Dragons of Mugloar</h1>
      <p className={styles.lede}>
        Train your dragon, take on quests for gold, and reach 1000 points.
      </p>
      <ul className={styles.rules} data-panel>
        {RULES.map(({ frame, text }) => (
          <li key={text}>
            <SpriteIcon frame={frame} scale={2} />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {error && <Alert>{error}</Alert>}
      <Button className={styles.cta} disabled={busy} onClick={createGame}>
        Start a game
      </Button>
    </main>
  );
};
