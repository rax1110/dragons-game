import { Encoding, type AdId, type RankedAd } from '@dragons/game-core';
import { Button } from '../../shared/button.tsx';
import { SpriteIcon } from '../../shared/sprite-icon.tsx';
import { Icons } from '../../shared/sprites.ts';
import {
  deriveRisk,
  formatPercent,
  formatTurns,
  isLastChance,
} from './format.ts';
import styles from './quest-entry.module.css';

type Props = {
  ad: RankedAd;
  disabled: boolean;
  onSolve: (adId: AdId) => void;
};

export const QuestEntry = ({ ad, disabled, onSolve }: Props) => (
  <article
    className={styles.entry}
    data-panel
    data-risk={deriveRisk(ad)}
    data-recommended={ad.recommended || undefined}
  >
    <header className={styles.head}>
      <span className={styles.risk}>
        {ad.probability} · {formatPercent(ad.successRate)}
      </span>
      {ad.recommended && (
        <span className={styles.seal}>
          <SpriteIcon frame={Icons.Chest} />
          Recommended
        </span>
      )}
      {ad.encoding !== Encoding.Plain && (
        <span className={styles.chip}>{ad.encoding}</span>
      )}
      {ad.harmful && (
        <span className={styles.chip} data-tone="warn">
          <SpriteIcon frame={Icons.Skull} />
          Hurts reputation
        </span>
      )}
    </header>
    <p className={styles.message}>{ad.message}</p>
    <dl className={styles.facts}>
      <div>
        <dt>Reward</dt>
        <dd>
          <SpriteIcon frame={Icons.Coin} />
          {ad.reward}
        </dd>
      </div>
      <div>
        <dt>Expected</dt>
        <dd>{Math.round(ad.expectedValue)}</dd>
      </div>
      <div>
        <dt>Expires</dt>
        <dd data-urgent={isLastChance(ad) || undefined}>
          {formatTurns(ad.expiresIn)}
        </dd>
      </div>
    </dl>
    <Button
      variant={ad.recommended ? 'primary' : 'secondary'}
      disabled={disabled}
      onClick={() => onSolve(ad.adId)}
    >
      Solve
    </Button>
  </article>
);
