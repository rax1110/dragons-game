import { GameStateSchema } from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Game } from './game.tsx';

vi.mock('../world/world-view.tsx', () => ({
  WorldView: () => null,
  showTown: () => {},
}));

const state = GameStateSchema.parse(fixtures.start);

describe('Game', () => {
  it('shows the quest board and the hotbar for a running game', () => {
    render(<Game state={state} />);

    expect(screen.getByRole('region', { name: 'Quest board' })).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Let the dragon fly' }),
    ).toBeDefined();
  });

  it('hides the quest board when the quests slot is toggled off', () => {
    render(<Game state={state} />);

    fireEvent.click(screen.getByRole('button', { name: 'Quests' }));

    expect(screen.queryByRole('region', { name: 'Quest board' })).toBeNull();
  });

  it('rests the dragon and offers a new game once the lives run out', () => {
    render(<Game state={{ ...state, lives: 0 }} />);

    expect(
      screen.getByRole('heading', { name: 'The dragon rests' }),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: 'Play again' })).toBeDefined();
    expect(screen.queryByRole('region', { name: 'Quest board' })).toBeNull();
  });
});
