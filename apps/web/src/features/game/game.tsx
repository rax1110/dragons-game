import { canContinue, type GameState } from '@dragons/game-core';
import { useState } from 'react';
import { Alert } from '../../shared/note.tsx';
import { WorldView } from '../world/world-view.tsx';
import { EventLog } from './event-log.tsx';
import { GameOver } from './game-over.tsx';
import { useGameStore } from './game-store.ts';
import styles from './game.module.css';
import { Hotbar } from './hotbar.tsx';
import { Hud } from './hud.tsx';
import { QuestBoard } from './quest-board.tsx';

type Props = { state: GameState };

export const Game = ({ state }: Props) => {
  const error = useGameStore((store) => store.error);
  const [questsOpen, setQuestsOpen] = useState(true);
  const over = !canContinue(state);
  const showQuests = !over && questsOpen;

  return (
    <main className={styles.game} data-quests={showQuests || undefined}>
      <div className={styles.column}>
        <Hud state={state} />
        <div className={styles.stage}>
          <div className={styles.town}>
            <WorldView />
            {over && <GameOver state={state} />}
          </div>
          <EventLog />
        </div>
        {error && <Alert>{error}</Alert>}
        {!over && (
          <Hotbar
            state={state}
            questsOpen={questsOpen}
            onToggleQuests={() => setQuestsOpen(!questsOpen)}
          />
        )}
      </div>
      {showQuests && <QuestBoard />}
    </main>
  );
};
