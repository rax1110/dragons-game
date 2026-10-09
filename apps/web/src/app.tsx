import { useEffect } from 'react';
import { Game } from './features/game/game.tsx';
import { useGameStore } from './features/game/game-store.ts';
import { Lobby } from './features/game/lobby.tsx';
import ui from './shared/ui.module.css';

export const App = () => {
  const gameId = useGameStore((store) => store.gameId);
  const state = useGameStore((store) => store.state);
  const resumeGame = useGameStore((store) => store.resumeGame);
  const resuming = gameId !== null && state === null;

  useEffect(() => {
    if (resuming) void resumeGame();
  }, [resuming, resumeGame]);

  if (!gameId) return <Lobby />;

  if (!state) {
    return (
      <main>
        <p className={ui.hint}>Loading your game…</p>
      </main>
    );
  }

  return <Game state={state} />;
};
