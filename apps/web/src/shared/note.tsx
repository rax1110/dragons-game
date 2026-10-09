import type { ReactNode } from 'react';
import styles from './note.module.css';

type Props = { children: ReactNode };

export const Hint = ({ children }: Props) => (
  <p className={styles.note}>{children}</p>
);

export const Alert = ({ children }: Props) => (
  <p role="alert" className={styles.note} data-tone="error">
    {children}
  </p>
);
