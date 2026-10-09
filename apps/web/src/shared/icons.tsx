import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const buildIcon = (paths: string) => {
  const Icon = ({ size = 18, ...props }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths} />
    </svg>
  );

  return Icon;
};

export const FlameIcon = buildIcon(
  'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z',
);

export const HeartIcon = buildIcon(
  'M19 14c1.5-1.4 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .9-4.5 2.5C10.5 3.9 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.1 3 5.5l7 7Z',
);

export const CoinIcon = buildIcon(
  'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v8m-2.5-6h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4',
);

export const HourglassIcon = buildIcon(
  'M5 22h14M5 2h14m-2 20v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2',
);

export const ShieldIcon = buildIcon(
  'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z',
);

export const SparklesIcon = buildIcon(
  'M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0Z',
);

export const BotIcon = buildIcon(
  'M12 8V4H8m-4 4h16v12H4zm-2 6h2m16 0h2m-7-1v2m-6-2v2',
);

export const PotionIcon = buildIcon(
  'M10 2v7.53a2 2 0 0 1-.21.9L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.07-10.13a2 2 0 0 1-.21-.89V2M8.5 2h7M7 16h10',
);

export const ClawIcon = buildIcon(
  'M6 3c3 5 4 10 3 18M12 2c3 5 4 10 3 19M18 4c2 4 2 9 0 16',
);

export const BookIcon = buildIcon(
  'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20',
);

export const WingsIcon = buildIcon(
  'M12 12C10 7 6 5 2 6c2 2 4 5 10 6Zm0 0c2-5 6-7 10-6-2 2-4 5-10 6Zm0 0v8',
);
