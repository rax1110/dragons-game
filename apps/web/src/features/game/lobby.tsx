import ui from '../../shared/ui.module.css';
import {
  CoinIcon,
  FlameIcon,
  HeartIcon,
  HourglassIcon,
} from '../../shared/icons.tsx';
import { selectBusy, useGameStore } from './game-store.ts';
import styles from './lobby.module.css';

const RULES = [
  {
    Icon: HourglassIcon,
    text: 'Each ad stays for a few turns. Solving, shopping and investigating take one turn each.',
  },
  {
    Icon: CoinIcon,
    text: 'A solved ad adds its reward to your gold and your score. Shopping spends gold, never score.',
  },
  {
    Icon: HeartIcon,
    text: 'A failed ad costs a life. A potion gives one back, an upgrade makes the ads easier.',
  },
];

export const Lobby = () => {
  const busy = useGameStore(selectBusy);
  const error = useGameStore((store) => store.error);
  const createGame = useGameStore((store) => store.createGame);

  return (
    <main className={styles.lobby}>
      <span className={styles.mark}>
        <FlameIcon size={30} />
      </span>
      <p className={styles.kicker}>Kingdom of Mugloar</p>
      <h1 className={styles.title}>Dragons of Mugloar</h1>
      <p className={styles.lede}>
        Take on ads for gold, keep your dragon alive, and reach 1000 points.
      </p>
      <ul className={styles.rules}>
        {RULES.map(({ Icon, text }) => (
          <li key={text}>
            <Icon size={20} />
            <span>{text}</span>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className={ui.error}>
          {error}
        </p>
      )}
      <button
        type="button"
        data-variant="primary"
        className={styles.cta}
        disabled={busy}
        onClick={createGame}
      >
        Start a game
      </button>
    </main>
  );
};
