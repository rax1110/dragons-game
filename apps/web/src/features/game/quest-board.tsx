import type { AdId } from '@dragons/game-core';
import { Hint } from '../../shared/note.tsx';
import { showTown } from '../world/world-view.tsx';
import { selectBusy, selectRecommendedAd, useGameStore } from './game-store.ts';
import styles from './quest-board.module.css';
import { QuestEntry } from './quest-entry.tsx';

export const QuestBoard = () => {
  const ads = useGameStore((store) => store.ads);
  const recommended = useGameStore(selectRecommendedAd);
  const busy = useGameStore(selectBusy);
  const solveAd = useGameStore((store) => store.solveAd);
  const solve = (adId: AdId) => {
    showTown();

    return solveAd(adId);
  };

  return (
    <section
      id="quest-board"
      className={styles.board}
      aria-labelledby="quest-board-title"
    >
      <h2 id="quest-board-title">Quest board</h2>
      {!recommended && (
        <Hint>
          No safe quest right now. A potion passes the turn, or pick the quest
          with the best odds.
        </Hint>
      )}
      {ads.map((ad) => (
        <QuestEntry key={ad.adId} ad={ad} disabled={busy} onSolve={solve} />
      ))}
    </section>
  );
};
