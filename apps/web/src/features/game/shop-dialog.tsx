import type { ShopItem } from '@dragons/game-core';
import {
  BookIcon,
  ClawIcon,
  CoinIcon,
  FlameIcon,
  PotionIcon,
  ShieldIcon,
  WingsIcon,
} from '../../shared/icons.tsx';
import ui from '../../shared/ui.module.css';
import { useDialog } from '../../shared/use-dialog.ts';
import { describeItem } from './format.ts';
import { selectBusy, useGameStore } from './game-store.ts';
import styles from './shop-dialog.module.css';

type Props = { open: boolean; gold: number; onClose: () => void };

const ICON_BY_ITEM = new Map([
  ['hpot', PotionIcon],
  ['cs', ClawIcon],
  ['ch', ClawIcon],
  ['gas', FlameIcon],
  ['rf', FlameIcon],
  ['wax', ShieldIcon],
  ['iron', ShieldIcon],
  ['tricks', BookIcon],
  ['mtrix', BookIcon],
  ['wingpot', WingsIcon],
  ['wingpotmax', WingsIcon],
]);

const buildItemIcon = (item: ShopItem) => {
  const Icon = ICON_BY_ITEM.get(item.id) ?? CoinIcon;

  return <Icon size={20} />;
};

export const ShopDialog = ({ open, gold, onClose }: Props) => {
  const shop = useGameStore((store) => store.shop);
  const busy = useGameStore(selectBusy);
  const buyItem = useGameStore((store) => store.buyItem);
  const ref = useDialog(open);

  return (
    <dialog
      ref={ref}
      className={ui.sheet}
      closedby="any"
      aria-labelledby="shop-title"
      onClose={onClose}
    >
      <h2 id="shop-title">Shop</h2>
      <p className={ui.hint}>
        Every purchase takes a turn, even one you cannot afford. You have {gold}{' '}
        gold.
      </p>
      <ul className={styles.list}>
        {shop.map((item) => (
          <li key={item.id}>
            <span className={styles.icon}>{buildItemIcon(item)}</span>
            <span className={styles.name}>
              {item.name}
              <small className={ui.muted}>{describeItem(item)}</small>
            </span>
            <button
              type="button"
              disabled={busy || gold < item.cost}
              onClick={() => buyItem(item.id)}
              aria-label={`Buy ${item.name} for ${item.cost} gold`}
            >
              {item.cost}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={ui.close} onClick={onClose}>
        Close
      </button>
    </dialog>
  );
};
