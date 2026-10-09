import type { GameState } from '@dragons/game-core';
import { useState } from 'react';
import { BotIcon, CoinIcon, ShieldIcon } from '../../shared/icons.tsx';
import styles from './action-bar.module.css';
import { Phase, selectBusy, useGameStore } from './game-store.ts';
import { ReputationDialog } from './reputation-dialog.tsx';
import { ShopDialog } from './shop-dialog.tsx';

type Props = { state: GameState };

export const ActionBar = ({ state }: Props) => {
  const phase = useGameStore((store) => store.phase);
  const busy = useGameStore(selectBusy);
  const startAutoplay = useGameStore((store) => store.startAutoplay);
  const stopAutoplay = useGameStore((store) => store.stopAutoplay);
  const [shopOpen, setShopOpen] = useState(false);
  const [reputationOpen, setReputationOpen] = useState(false);
  const autoplaying = phase === Phase.Autoplay;

  return (
    <nav
      className={styles.bar}
      data-autoplay={autoplaying || undefined}
      aria-label="Game actions"
    >
      <button type="button" disabled={busy} onClick={() => setShopOpen(true)}>
        <CoinIcon size={16} />
        Shop
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => setReputationOpen(true)}
      >
        <ShieldIcon size={16} />
        Reputation
      </button>
      {autoplaying ? (
        <button type="button" data-variant="primary" onClick={stopAutoplay}>
          <BotIcon size={16} />
          Stop
        </button>
      ) : (
        <button
          type="button"
          data-variant="primary"
          disabled={busy}
          onClick={startAutoplay}
        >
          <BotIcon size={16} />
          Autoplay
        </button>
      )}
      <ShopDialog
        open={shopOpen}
        gold={state.gold}
        onClose={() => setShopOpen(false)}
      />
      <ReputationDialog
        open={reputationOpen}
        onClose={() => setReputationOpen(false)}
      />
    </nav>
  );
};
