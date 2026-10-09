import styles from './sprite-icon.module.css';
import { SHEETS, type Frame } from './sprites.ts';

type Props = { frame: Frame; scale?: number; label?: string };

export const SpriteIcon = ({ frame, scale = 1, label = '' }: Props) => {
  const { url, cell, columns } = SHEETS[frame.sheet];
  const column = frame.index % columns;
  const row = Math.floor(frame.index / columns);

  return (
    <img
      className={styles.sprite}
      src={url}
      alt={label}
      width={cell}
      height={cell}
      style={{
        zoom: scale,
        objectPosition: `${-column * cell}px ${-row * cell}px`,
      }}
    />
  );
};
