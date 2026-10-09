import ui from '../../shared/ui.module.css';
import { useDialog } from '../../shared/use-dialog.ts';
import { selectBusy, useGameStore } from './game-store.ts';
import styles from './reputation-dialog.module.css';

type Props = { open: boolean; onClose: () => void };

const FACTIONS = ['people', 'state', 'underworld'] as const;

const SCALE = 20;

export const ReputationDialog = ({ open, onClose }: Props) => {
  const reputation = useGameStore((store) => store.reputation);
  const busy = useGameStore(selectBusy);
  const investigate = useGameStore((store) => store.investigateReputation);
  const ref = useDialog(open);

  return (
    <dialog
      ref={ref}
      className={ui.sheet}
      closedby="any"
      aria-labelledby="reputation-title"
      onClose={onClose}
    >
      <h2 id="reputation-title">Reputation</h2>
      <p className={ui.hint}>
        Investigating costs a turn. Stealing lowers your standing with the state
        and leads to traps.
      </p>
      {reputation ? (
        <dl className={styles.factions}>
          {FACTIONS.map((faction) => (
            <div key={faction} className={styles.faction}>
              <dt>{faction}</dt>
              <dd data-negative={reputation[faction] < 0 || undefined}>
                <progress
                  className={styles.bar}
                  value={Math.abs(reputation[faction])}
                  max={SCALE}
                />
                <span className={styles.value}>
                  {reputation[faction].toFixed(1)}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={ui.muted}>Not investigated yet.</p>
      )}
      <button type="button" disabled={busy} onClick={investigate}>
        Investigate (costs a turn)
      </button>
      <button type="button" className={ui.close} onClick={onClose}>
        Close
      </button>
    </dialog>
  );
};
