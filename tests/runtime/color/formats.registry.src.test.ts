import { describe, expect, it } from 'vitest';

import type { FormatName } from '../../../src/color';
import { colorFormats } from '../../../src/color/formats';

/**
 * The unified registry: one descriptor per known format name, keyed by that name.
 * This is the single source the book's output and the fallback helper both read.
 */

const NAMES: FormatName[] = [
  'rgba',
  'rgb',
  'hex',
  'hexAlpha',
  'hsl',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'displayP3',
];

describe('color format registry', () => {
  it('has a descriptor for every format name, keyed by its format', () => {
    for (const name of NAMES) {
      const d = colorFormats[name];
      expect(d).toBeDefined();
      expect(d.format).toBe(name);
      expect(typeof d.render).toBe('function');
    }
  });

  it('covers exactly the known formats', () => {
    expect(Object.keys(colorFormats).sort()).toEqual(
      [
        ...NAMES,
      ].sort(),
    );
  });
});
