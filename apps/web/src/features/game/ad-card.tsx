import { Encoding, type AdId, type RankedAd } from '@dragons/game-core';
import { CoinIcon, HourglassIcon, SparklesIcon } from '../../shared/icons.tsx';
import styles from './ad-card.module.css';
import { deriveRisk, formatPercent, formatTurns } from './format.ts';

type Props = {
  ad: RankedAd;
  disabled: boolean;
  onSolve: (adId: AdId) => void;
};

export const AdCard = ({ ad, disabled, onSolve }: Props) => (
  <article
    className={styles.card}
    data-risk={deriveRisk(ad)}
    data-recommended={ad.recommended || undefined}
  >
    <header className={styles.head}>
      <span className={styles.risk}>
        {ad.probability} · {formatPercent(ad.successRate)}
      </span>
      {ad.recommended && (
        <span className={styles.seal}>
          <SparklesIcon size={14} />
          Recommended
        </span>
      )}
      {ad.encoding !== Encoding.Plain && (
        <span className={styles.chip}>{ad.encoding}</span>
      )}
      {ad.harmful && (
        <span className={styles.chip} data-tone="warn">
          Hurts reputation
        </span>
      )}
    </header>
    <p className={styles.message}>{ad.message}</p>
    <dl className={styles.facts}>
      <div>
        <dt>Reward</dt>
        <dd>
          <CoinIcon size={14} />
          {ad.reward}
        </dd>
      </div>
      <div>
        <dt>Expected</dt>
        <dd>{Math.round(ad.expectedValue)}</dd>
      </div>
      <div>
        <dt>Expires</dt>
        <dd>
          <HourglassIcon size={14} />
          {formatTurns(ad.expiresIn)}
        </dd>
      </div>
    </dl>
    <button
      type="button"
      data-variant={ad.recommended ? 'primary' : undefined}
      disabled={disabled}
      onClick={() => onSolve(ad.adId)}
    >
      Solve
    </button>
  </article>
);
