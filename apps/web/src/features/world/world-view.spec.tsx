import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameStore } from '../game/game-store.ts';
import { createWorld } from './create-world.ts';
import { WorldView } from './world-view.tsx';

vi.mock('./create-world.ts', () => ({
  createWorld: vi.fn(),
  loadSheets: vi.fn(),
}));

describe('WorldView', () => {
  it('mounts the town into its host and tears it down on unmount', async () => {
    const destroy = vi.fn();
    vi.mocked(createWorld).mockResolvedValue({ destroy });

    const { container, unmount } = render(<WorldView />);

    await vi.waitFor(() =>
      expect(createWorld).toHaveBeenCalledWith({
        host: container.firstElementChild,
        store: useGameStore,
      }),
    );
    unmount();
    await vi.waitFor(() => expect(destroy).toHaveBeenCalled());
  });

  it('renders without the town when it cannot be drawn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(createWorld).mockRejectedValue(new Error('No WebGL'));

    const { unmount } = render(<WorldView />);

    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    unmount();
    warn.mockRestore();
  });
});
