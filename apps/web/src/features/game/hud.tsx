import {
  STARTING_LIVES,
  TARGET_SCORE,
  type GameState,
} from '@dragons/game-core';
import { SpriteIcon } from '../../shared/sprite-icon.tsx';
import { Actors, Icons } from '../../shared/sprites.ts';
import styles from './hud.module.css';

type Props = { state: GameState };

const Hearts = ({ lives }: { lives: number }) => (
  <span className={styles.hearts} aria-label={`${lives} lives`}>
    {Array.from({ length: Math.max(STARTING_LIVES, lives) }, (_, index) => (
      <span key={index} data-filled={index < lives || undefined}>
        ♥
      </span>
    ))}
  </span>
);

export const Hud = ({ state }: Props) => (
  <header className={styles.hud}>
    <div className={styles.character} data-panel>
      <SpriteIcon frame={Actors.Trainer} scale={2} />
      <div className={styles.identity}>
        <strong>Dragon trainer</strong>
        <Hearts lives={state.lives} />
      </div>
      <span key={state.level} className={`${styles.level} ${styles.pop}`}>
        Lv {state.level}
      </span>
    </div>
    <dl className={styles.resources}>
      <div>
        <dt>Gold</dt>
        <dd key={state.gold} className={styles.pop}>
          <SpriteIcon frame={Icons.Gold} />
          {state.gold}
        </dd>
      </div>
      <div>
        <dt>Turn</dt>
        <dd>{state.turn}</dd>
      </div>
    </dl>
    <dl className={styles.score}>
      <dt>Score</dt>
      <dd>
        <progress
          className={styles.progress}
          aria-label={`Progress to ${TARGET_SCORE} points`}
          value={state.score}
          max={TARGET_SCORE}
        />
      </dd>
      <dd key={state.score} className={`${styles.total} ${styles.pop}`}>
        {state.score}
      </dd>
    </dl>
  </header>
);
