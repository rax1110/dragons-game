import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button.tsx';

describe('Button', () => {
  it('is primary by default, never submits, and keeps an extra class', () => {
    render(<Button className="cta">Start</Button>);

    const button = screen.getByRole('button', { name: 'Start' });

    expect(button).toHaveProperty('type', 'button');
    expect(button.dataset.variant).toBe('primary');
    expect(button.className).toContain('cta');
  });
});
