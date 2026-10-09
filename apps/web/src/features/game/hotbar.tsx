import type { GameState } from '@dragons/game-core';
import { useState } from 'react';
import { Button } from '../../shared/button.tsx';
import { SpriteIcon } from '../../shared/sprite-icon.tsx';
import { Actors, deriveDragonFrame, Icons } from '../../shared/sprites.ts';
import { showTown } from '../world/world-view.tsx';
import { Phase, selectBusy, useGameStore } from './game-store.ts';
import styles from './hotbar.module.css';
import { MerchantDialog } from './merchant-dialog.tsx';
import { ReputationDialog } from './reputation-dialog.tsx';

type Props = {
  state: GameState;
  questsOpen: boolean;
  onToggleQuests: () => void;
};

export const Hotbar = ({ state, questsOpen, onToggleQuests }: Props) => {
  const phase = useGameStore((store) => store.phase);
  const busy = useGameStore(selectBusy);
  const startAutoplay = useGameStore((store) => store.startAutoplay);
  const stopAutoplay = useGameStore((store) => store.stopAutoplay);
  const [merchantOpen, setMerchantOpen] = useState(false);
  const [reputationOpen, setReputationOpen] = useState(false);
  const autoplaying = phase === Phase.Autoplay;
  const dragon = deriveDragonFrame(state.level);
  const openMerchant = () => {
    showTown();
    setMerchantOpen(true);
  };

  return (
    <nav
      className={styles.bar}
      data-autoplay={autoplaying || undefined}
      aria-label="Hotbar"
    >
      <Button
        variant="secondary"
        className={styles.slot}
        aria-pressed={questsOpen}
        onClick={onToggleQuests}
      >
        <SpriteIcon frame={Icons.Sign} scale={2} />
        <span className={styles.label}>Quests</span>
      </Button>
      <Button
        variant="secondary"
        className={styles.slot}
        disabled={busy}
        onClick={openMerchant}
      >
        <SpriteIcon frame={Actors.Merchant} />
        <span className={styles.label}>Merchant</span>
      </Button>
      <Button
        variant="secondary"
        className={styles.slot}
        disabled={busy}
        onClick={() => setReputationOpen(true)}
      >
        <SpriteIcon frame={Icons.Skull} scale={2} />
        <span className={styles.label}>Reputation</span>
      </Button>
      <Button
        className={styles.slot}
        disabled={phase === Phase.Busy}
        onClick={autoplaying ? stopAutoplay : startAutoplay}
      >
        <SpriteIcon frame={dragon} />
        <span className={styles.label}>
          {autoplaying ? 'Call the dragon back' : 'Let the dragon fly'}
        </span>
      </Button>
      {merchantOpen && (
        <MerchantDialog
          gold={state.gold}
          onClose={() => setMerchantOpen(false)}
        />
      )}
      {reputationOpen && (
        <ReputationDialog onClose={() => setReputationOpen(false)} />
      )}
    </nav>
  );
};
