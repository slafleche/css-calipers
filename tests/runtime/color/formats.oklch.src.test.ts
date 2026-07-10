import { describe, expect, it } from 'vitest';

import {
  color,
  type ColorInput,
  defaultColorConfig,
  parseColor,
  storeColor,
} from '../../../src/color';
import { oklch } from '../../../src/color/formats/oklch/oklch';

/**
 * The oklch format descriptor. Two things: its fallback metadata, and that its
 * `render` matches the book's existing `oklch().css()` output (parity, so extracting
 * the per-format render cannot drift from `serialize`).
 */

/** The canonical OKLCH store color for an input (what `descriptor.render` takes). */
const stored = (input: ColorInput) => {
  const s = storeColor(parseColor(input));
  if (s.kind !== 'color')
    throw new Error('expected a translatable color');
  return s.color;
};

describe('oklch descriptor — metadata', () => {
  it('is a syntax-only modern format, not an sRGB floor', () => {
    expect(oklch.format).toBe('oklch');
    expect(oklch.supportsProbe).toBe('(color: oklch(0 0 0))');
    expect(oklch.gamutDependent).toBe(false);
    expect(oklch.srgbFloor).toBe(false);
  });
});

describe('oklch descriptor — render parity with the book', () => {
  it('matches oklch().css() for an opaque color', () => {
    expect(oklch.render(stored('#3366cc'), defaultColorConfig)).toBe(
      color('#3366cc').oklch().css(),
    );
  });

  it('matches for a color with alpha', () => {
    const input = {
      space: 'oklch',
      l: 0.6,
      c: 0.13,
      h: 250,
      alpha: 0.5,
    } as const;
    expect(oklch.render(stored(input), defaultColorConfig)).toBe(
      color(input).oklch().css(),
    );
  });

  it('drops the opaque alpha slot when omitOpaqueAlpha is on', () => {
    const cfg = { ...defaultColorConfig, omitOpaqueAlpha: true };
    const rendered = oklch.render(stored('#3366cc'), cfg);
    expect(rendered.includes(' / ')).toBe(false);
    expect(rendered.startsWith('oklch(')).toBe(true);
  });
});
