import type { ComponentProps } from 'react';
import styles from './button.module.css';

type Props = ComponentProps<'button'> & { variant?: 'primary' | 'secondary' };

export const Button = ({ variant = 'primary', className, ...props }: Props) => (
  <button
    type="button"
    {...props}
    className={[styles.button, className].filter(Boolean).join(' ')}
    data-variant={variant}
  />
);
