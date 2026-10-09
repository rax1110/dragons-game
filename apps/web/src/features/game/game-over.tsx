import { TARGET_SCORE, type GameState } from '@dragons/game-core';
import { Button } from '../../shared/button.tsx';
import styles from './game-over.module.css';
import { selectBusy, useGameStore } from './game-store.ts';

type Props = { state: GameState };

export const GameOver = ({ state }: Props) => {
  const busy = useGameStore(selectBusy);
  const createGame = useGameStore((store) => store.createGame);
  const reachedTarget = state.score >= TARGET_SCORE;

  return (
    <section className={styles.over} aria-labelledby="over-title">
      <h2 id="over-title" className={styles.kicker}>
        The dragon rests
      </h2>
      <p className={styles.finalScore}>{state.score}</p>
      <p className={styles.verdict} data-reached={reachedTarget || undefined}>
        {reachedTarget
          ? `Target of ${TARGET_SCORE} reached`
          : `Short of ${TARGET_SCORE}`}
        {` · ${state.turn} turns · level ${state.level}`}
      </p>
      <Button disabled={busy} onClick={createGame}>
        Play again
      </Button>
    </section>
  );
};
