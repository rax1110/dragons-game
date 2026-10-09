import { decodeAds, rankAds, RankedAdSchema } from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { QuestEntry } from './quest-entry.tsx';

const [recommended, deadly] = z
  .tuple([RankedAdSchema, RankedAdSchema])
  .parse(rankAds(decodeAds([fixtures.plainAd, fixtures.base64Ad]), 3));

describe('QuestEntry', () => {
  it('marks the recommended quest and lets the player solve it', () => {
    const onSolve = vi.fn();

    render(<QuestEntry ad={recommended} disabled={false} onSolve={onSolve} />);
    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));

    expect(screen.getByText('Recommended')).toBeDefined();
    expect(screen.getByText('Sure thing · 95%')).toBeDefined();
    expect(onSolve).toHaveBeenCalledWith(recommended.adId);
  });

  it('shows how a decoded quest was encrypted and blocks solving while busy', () => {
    render(<QuestEntry ad={deadly} disabled={true} onSolve={vi.fn()} />);

    expect(screen.getByText('base64')).toBeDefined();
    expect(screen.queryByText('Recommended')).toBeNull();
    expect(screen.getByRole('button', { name: 'Solve' })).toHaveProperty(
      'disabled',
      true,
    );
  });
});
