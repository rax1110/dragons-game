import { ShopSchema } from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameStore } from './game-store.ts';
import { MerchantDialog } from './merchant-dialog.tsx';

const shop = ShopSchema.parse(fixtures.shop);

describe('MerchantDialog', () => {
  it('only lets the player buy what they can afford', () => {
    useGameStore.setState({ shop });

    render(<MerchantDialog gold={60} onClose={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Buy Healing potion for 50 gold' }),
    ).toHaveProperty('disabled', false);
    expect(
      screen.getByRole('button', { name: 'Buy Claw Sharpening for 100 gold' }),
    ).toHaveProperty('disabled', true);
    expect(screen.getByText('+1 life')).toBeDefined();
  });
});
