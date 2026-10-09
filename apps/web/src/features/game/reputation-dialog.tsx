import { Button } from '../../shared/button.tsx';
import { Dialog } from '../../shared/dialog.tsx';
import { Hint } from '../../shared/note.tsx';
import { selectBusy, useGameStore } from './game-store.ts';
import styles from './reputation-dialog.module.css';

type Props = { onClose: () => void };

const FACTIONS = ['people', 'state', 'underworld'] as const;

const SCALE = 20;

export const ReputationDialog = ({ onClose }: Props) => {
  const reputation = useGameStore((store) => store.reputation);
  const busy = useGameStore(selectBusy);
  const investigate = useGameStore((store) => store.investigateReputation);

  return (
    <Dialog title="Reputation" onClose={onClose}>
      <Hint>
        Investigating costs a turn. Stealing lowers your standing with the state
        and leads to traps.
      </Hint>
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
        <Hint>Not investigated yet.</Hint>
      )}
      <Button variant="secondary" disabled={busy} onClick={investigate}>
        Investigate (costs a turn)
      </Button>
    </Dialog>
  );
};
