import { Button } from '../../shared/button.tsx';
import { Dialog } from '../../shared/dialog.tsx';
import { Hint } from '../../shared/note.tsx';
import { SpriteIcon } from '../../shared/sprite-icon.tsx';
import { deriveItemFrame } from '../../shared/sprites.ts';
import { describeItem } from './format.ts';
import { selectBusy, useGameStore } from './game-store.ts';
import styles from './merchant-dialog.module.css';

type Props = { gold: number; onClose: () => void };

export const MerchantDialog = ({ gold, onClose }: Props) => {
  const shop = useGameStore((store) => store.shop);
  const busy = useGameStore(selectBusy);
  const buyItem = useGameStore((store) => store.buyItem);

  return (
    <Dialog title="Merchant" onClose={onClose}>
      <Hint>
        Every purchase takes a turn, even one you cannot afford. You carry{' '}
        {gold} gold.
      </Hint>
      <ul className={styles.list}>
        {shop.map((item) => (
          <li key={item.id}>
            <span className={styles.icon}>
              <SpriteIcon frame={deriveItemFrame(item)} scale={2} />
            </span>
            <span className={styles.name}>
              {item.name}
              <small>{describeItem(item)}</small>
            </span>
            <Button
              variant="secondary"
              disabled={busy || gold < item.cost}
              onClick={() => buyItem(item.id)}
              aria-label={`Buy ${item.name} for ${item.cost} gold`}
            >
              {item.cost}
            </Button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
};
