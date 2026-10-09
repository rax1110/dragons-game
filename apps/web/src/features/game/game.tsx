import { canContinue, TARGET_SCORE, type GameState } from '@dragons/game-core';
import ui from '../../shared/ui.module.css';
import { ActionBar } from './action-bar.tsx';
import { AdCard } from './ad-card.tsx';
import { selectBusy, selectRecommendedAd, useGameStore } from './game-store.ts';
import styles from './game.module.css';
import { StatusBar } from './status-bar.tsx';

type Props = { state: GameState };

export const Game = ({ state }: Props) => {
  const ads = useGameStore((store) => store.ads);
  const recommended = useGameStore(selectRecommendedAd);
  const busy = useGameStore(selectBusy);
  const error = useGameStore((store) => store.error);
  const lastEvent = useGameStore((store) => store.lastEvent);
  const solveAd = useGameStore((store) => store.solveAd);
  const createGame = useGameStore((store) => store.createGame);
  const over = !canContinue(state);
  const reachedTarget = state.score >= TARGET_SCORE;

  return (
    <main className={styles.game}>
      <StatusBar state={state} lastEvent={lastEvent} />
      {error && (
        <p role="alert" className={ui.error}>
          {error}
        </p>
      )}
      {over && (
        <section className={styles.over}>
          <p className={styles.kicker}>The dragon rests</p>
          <h2 className={styles.finalScore}>{state.score}</h2>
          <p
            className={styles.verdict}
            data-reached={reachedTarget || undefined}
          >
            {reachedTarget
              ? `Target of ${TARGET_SCORE} reached`
              : `Short of ${TARGET_SCORE}`}
            {` · ${state.turn} turns · level ${state.level}`}
          </p>
          <button
            type="button"
            data-variant="primary"
            disabled={busy}
            onClick={createGame}
          >
            Play again
          </button>
        </section>
      )}
      {!over && (
        <section className={styles.board} aria-label="Ads">
          {!recommended && (
            <p className={ui.hint}>
              No safe ad right now. A potion passes the turn, or pick the ad
              with the best odds.
            </p>
          )}
          {ads.map((ad) => (
            <AdCard key={ad.adId} ad={ad} disabled={busy} onSolve={solveAd} />
          ))}
        </section>
      )}
      {!over && <ActionBar state={state} />}
    </main>
  );
};
