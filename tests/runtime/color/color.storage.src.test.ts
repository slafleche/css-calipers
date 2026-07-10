import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import {
  parseColor,
  type Store,
  storeColor,
} from '../../../src/color';

/*
 * STORAGE step (Part 2 of the color book): the canonical store normalizes every
 * translatable color to OKLCH, regardless of the input space, so downstream
 * steps work from one representation. Symbolic keywords pass through untouched.
 * Real assertions (no `it.todo`).
 */

const toRgb = converter('rgb');

// culori color objects are a discriminated union; tests read channels loosely.
const colorOf = (
  store: Store,
): Record<string, number | string | undefined> => {
  if (store.kind !== 'color') {
    throw new Error(
      `expected a translatable color, got "${store.kind}"`,
    );
  }
  return store.color as unknown as Record<
    string,
    number | string | undefined
  >;
};

describe('color storage — normalizes translatable colors to OKLCH', () => {
  it('rgb input becomes OKLCH and still represents the same color', () => {
    const stored = storeColor(parseColor('#3366cc'));
    expect(colorOf(stored).mode).toBe('oklch');
    const rgb = toRgb(
      stored.kind === 'color' ? stored.color : undefined,
    ) as unknown as Record<string, number>;
    expect(rgb.r).toBeCloseTo(0.2, 2);
    expect(rgb.g).toBeCloseTo(0.4, 2);
    expect(rgb.b).toBeCloseTo(0.8, 2);
  });

  it('hsl input becomes OKLCH', () => {
    expect(
      colorOf(storeColor(parseColor('hsl(220 60% 50%)'))).mode,
    ).toBe('oklch');
  });

  it('structured object input becomes OKLCH', () => {
    expect(
      colorOf(
        storeColor(parseColor({ space: 'lab', l: 50, a: 40, b: 60 })),
      ).mode,
    ).toBe('oklch');
  });

  it('OKLCH input stays OKLCH with stable coordinates', () => {
    const c = colorOf(storeColor(parseColor('oklch(70% 0.1 200)')));
    expect(c.mode).toBe('oklch');
    expect(c.l).toBeCloseTo(0.7, 2);
    expect(c.c).toBeCloseTo(0.1, 2);
    expect(c.h).toBeCloseTo(200, 0);
  });

  it('preserves alpha', () => {
    const c = colorOf(storeColor(parseColor('#3366cc80')));
    expect(c.mode).toBe('oklch');
    expect(c.alpha).toBeCloseTo(0.5, 2);
  });

  it('achromatic input stores chroma ~ 0', () => {
    const c = colorOf(storeColor(parseColor('#808080')));
    expect(c.mode).toBe('oklch');
    expect(c.c).toBeCloseTo(0, 2);
  });

  it('transparent becomes OKLCH with alpha 0', () => {
    const c = colorOf(storeColor(parseColor('transparent')));
    expect(c.mode).toBe('oklch');
    expect(c.alpha).toBe(0);
  });

  it('is idempotent: storing an already-stored color stays OKLCH', () => {
    const once = storeColor(parseColor('#3366cc'));
    const twice = storeColor(once);
    expect(colorOf(twice).mode).toBe('oklch');
  });

  it('normalizes a wide-gamut (display-p3) input to OKLCH', () => {
    const c = colorOf(
      storeColor(parseColor('color(display-p3 1 0 0)')),
    );
    expect(c.mode).toBe('oklch');
  });
});

describe('color storage — symbolic keywords pass through untouched', () => {
  it('returns the symbolic store unchanged', () => {
    const stored = storeColor(parseColor('currentColor'));
    expect(stored).toEqual({
      kind: 'symbolic',
      keyword: 'currentColor',
    });
  });

  it('passes a deprecated system color through', () => {
    const stored = storeColor(parseColor('ThreeDFace'));
    expect(stored).toEqual({
      kind: 'symbolic',
      keyword: 'ThreeDFace',
    });
  });
});
