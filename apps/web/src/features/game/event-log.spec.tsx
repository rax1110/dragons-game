import {
  ActionType,
  GameStateSchema,
  ShopItemSchema,
  type TurnEvent,
} from '@dragons/game-core';
import { fixtures } from '@dragons/game-core/fixtures';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EventLog } from './event-log.tsx';
import { useGameStore } from './game-store.ts';

const state = GameStateSchema.parse(fixtures.start);

const buildPurchase = (turn: number, succeeded: boolean): TurnEvent => ({
  move: { type: ActionType.Buy, item: ShopItemSchema.parse(fixtures.shop[0]) },
  state: { ...state, turn },
  message: succeeded ? 'Bought Healing potion' : 'Could not buy Healing potion',
  succeeded,
});

describe('EventLog', () => {
  it('lists the newest turn first and marks a failed one', () => {
    useGameStore.setState({
      events: [buildPurchase(1, true), buildPurchase(2, false)],
    });

    render(<EventLog />);

    const [newest, oldest] = screen.getAllByRole('listitem');

    expect(newest.textContent).toContain('Turn 2');
    expect(newest.dataset.failed).toBe('true');
    expect(oldest.dataset.failed).toBeUndefined();
  });
});
