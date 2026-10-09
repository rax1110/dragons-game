import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './dialog.tsx';

describe('Dialog', () => {
  it('opens as a modal named after its title and closes from the header', () => {
    const onClose = vi.fn();

    render(
      <Dialog title="Merchant" onClose={onClose}>
        <p>Wares</p>
      </Dialog>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByRole('dialog', { name: 'Merchant' })).toHaveProperty(
      'open',
      true,
    );
    expect(screen.getByText('Wares')).toBeDefined();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
