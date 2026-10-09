import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SHEETS } from './sprites.ts';

const PNG_WIDTH_OFFSET = 16;

const readWidth = (url: string) =>
  readFileSync(join(import.meta.dirname, '../../public', url)).readUInt32BE(
    PNG_WIDTH_OFFSET,
  );

describe('SHEETS', () => {
  it.each(Object.entries(SHEETS))(
    'packs the %s sheet in the columns it declares',
    (_, { url, cell, columns }) => {
      expect(readWidth(url)).toBe(columns * cell);
    },
  );
});
