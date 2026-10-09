import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './button.tsx';
import styles from './dialog.module.css';

type Props = { title: string; onClose: () => void; children: ReactNode };

export const Dialog = ({ title, onClose, children }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.sheet}
      data-panel
      closedby="any"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      <header className={styles.head}>
        <h2 id={titleId}>{title}</h2>
        <Button
          variant="secondary"
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </Button>
      </header>
      {children}
    </dialog>
  );
};
