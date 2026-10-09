import {
  TARGET_SCORE,
  type GameState,
  type TurnEvent,
} from '@dragons/game-core';
import { CoinIcon, HeartIcon, ShieldIcon } from '../../shared/icons.tsx';
import styles from './status-bar.module.css';

type Props = { state: GameState; lastEvent: TurnEvent | null };

const STARTING_LIVES = 3;

const Hearts = ({ lives }: { lives: number }) => (
  <span className={styles.hearts} aria-label={`${lives} lives`}>
    {Array.from({ length: Math.max(STARTING_LIVES, lives) }, (_, index) => (
      <HeartIcon
        key={index}
        size={16}
        data-filled={index < lives || undefined}
      />
    ))}
  </span>
);

export const StatusBar = ({ state, lastEvent }: Props) => {
  const failed = lastEvent !== null && !lastEvent.succeeded;

  return (
    <header className={styles.hud}>
      <dl className={styles.tiles}>
        <div className={styles.tile} data-stat="score">
          <dt>Score</dt>
          <dd key={state.score} className={styles.pop}>
            {state.score}
          </dd>
          <progress
            className={styles.progress}
            aria-label={`Progress to ${TARGET_SCORE} points`}
            value={state.score}
            max={TARGET_SCORE}
          />
        </div>
        <div className={styles.tile} data-stat="gold">
          <dt>Gold</dt>
          <dd key={state.gold} className={styles.pop}>
            <CoinIcon size={16} />
            {state.gold}
          </dd>
        </div>
        <div className={styles.tile} data-stat="lives">
          <dt>Lives</dt>
          <dd>
            <Hearts lives={state.lives} />
          </dd>
        </div>
        <div className={styles.tile} data-stat="level">
          <dt>Level</dt>
          <dd key={state.level} className={styles.pop}>
            <ShieldIcon size={16} />
            {state.level}
          </dd>
        </div>
        <div className={styles.tile} data-stat="turn">
          <dt>Turn</dt>
          <dd>{state.turn}</dd>
        </div>
      </dl>
      <p
        key={lastEvent?.state.turn ?? 0}
        className={styles.outcome}
        data-failed={failed || undefined}
        aria-live="polite"
      >
        {lastEvent?.message ?? 'Pick an ad to begin.'}
      </p>
    </header>
  );
};
