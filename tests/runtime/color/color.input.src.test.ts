import { describe, expect, it } from 'vitest';

import { color, parseColor, type Store } from '../../../src/color';

/*
 * INPUT step (Part 1 of the color book): every `make` form must parse into the
 * canonical store. Translatable values -> { kind:'color', color } (a culori color
 * object); symbolic keywords -> { kind:'symbolic', keyword }. These are real
 * assertions (no `it.todo`). The make x EMIT cells live in color.matrix.src.test.ts
 * and stay pending until the output step.
 */

// culori color objects are a discriminated union; tests read channels loosely.
const asColor = (store: Store): Record<string, number | string> => {
  if (store.kind !== 'color') {
    throw new Error(
      `expected a translatable color, got "${store.kind}"`,
    );
  }
  return store.color as unknown as Record<string, number | string>;
};

const asSymbolic = (store: Store): string => {
  if (store.kind !== 'symbolic') {
    throw new Error(
      `expected a symbolic keyword, got "${store.kind}"`,
    );
  }
  return store.keyword;
};

describe('color input — translatable strings parse into a color store', () => {
  it('named string -> sRGB point', () => {
    const c = asColor(parseColor('rebeccapurple')); // #663399
    expect(c.mode).toBe('rgb');
    expect(c.r).toBeCloseTo(0.4, 2);
    expect(c.g).toBeCloseTo(0.2, 2);
    expect(c.b).toBeCloseTo(0.6, 2);
  });

  it('hex string', () => {
    const c = asColor(parseColor('#3366cc'));
    expect(c.mode).toBe('rgb');
    expect(c.r).toBeCloseTo(0.2, 2);
    expect(c.g).toBeCloseTo(0.4, 2);
    expect(c.b).toBeCloseTo(0.8, 2);
  });

  it('hex string with alpha', () => {
    const c = asColor(parseColor('#3366cc80'));
    expect(c.mode).toBe('rgb');
    expect(c.alpha).toBeCloseTo(0.5, 2);
  });

  it('3-digit hex string (expands to #aabbcc)', () => {
    const c = asColor(parseColor('#abc'));
    expect(c.mode).toBe('rgb');
    expect(c.r).toBeCloseTo(0.667, 2);
    expect(c.g).toBeCloseTo(0.733, 2);
    expect(c.b).toBeCloseTo(0.8, 2);
  });

  it('4-digit hex string carries alpha', () => {
    const c = asColor(parseColor('#abcd'));
    expect(c.mode).toBe('rgb');
    expect(c.alpha).toBeCloseTo(0.867, 2);
  });

  it('rgb string', () => {
    const c = asColor(parseColor('rgb(51 102 204)'));
    expect(c.mode).toBe('rgb');
    expect(c.r).toBeCloseTo(0.2, 2);
    expect(c.g).toBeCloseTo(0.4, 2);
    expect(c.b).toBeCloseTo(0.8, 2);
  });

  it('hsl string', () => {
    const c = asColor(parseColor('hsl(220 60% 50%)'));
    expect(c.mode).toBe('hsl');
    expect(c.h).toBeCloseTo(220, 0);
    expect(c.s).toBeCloseTo(0.6, 2);
    expect(c.l).toBeCloseTo(0.5, 2);
  });

  it('hwb string', () => {
    const c = asColor(parseColor('hwb(220 20% 20%)'));
    expect(c.mode).toBe('hwb');
    expect(c.h).toBeCloseTo(220, 0);
    expect(c.w).toBeCloseTo(0.2, 2);
    expect(c.b).toBeCloseTo(0.2, 2);
  });

  it('lab string', () => {
    const c = asColor(parseColor('lab(50% 40 60)'));
    expect(c.mode).toBe('lab');
    expect(c.l).toBeCloseTo(50, 0);
    expect(c.a).toBeCloseTo(40, 0);
    expect(c.b).toBeCloseTo(60, 0);
  });

  it('lch string', () => {
    const c = asColor(parseColor('lch(50% 40 200)'));
    expect(c.mode).toBe('lch');
    expect(c.l).toBeCloseTo(50, 0);
    expect(c.c).toBeCloseTo(40, 0);
    expect(c.h).toBeCloseTo(200, 0);
  });

  it('oklab string', () => {
    const c = asColor(parseColor('oklab(0.5 0.1 0.1)'));
    expect(c.mode).toBe('oklab');
    expect(c.l).toBeCloseTo(0.5, 2);
    expect(c.a).toBeCloseTo(0.1, 2);
    expect(c.b).toBeCloseTo(0.1, 2);
  });

  it('oklch string', () => {
    const c = asColor(parseColor('oklch(70% 0.1 200)'));
    expect(c.mode).toBe('oklch');
    expect(c.l).toBeCloseTo(0.7, 2);
    expect(c.c).toBeCloseTo(0.1, 2);
    expect(c.h).toBeCloseTo(200, 0);
  });

  it('transparent -> rgb with alpha 0', () => {
    const c = asColor(parseColor('transparent'));
    expect(c.mode).toBe('rgb');
    expect(c.alpha).toBe(0);
  });
});

describe('color input — structured objects parse into a color store', () => {
  it('rgb object (0-255 -> 0-1)', () => {
    const c = asColor(
      parseColor({ space: 'rgb', r: 51, g: 102, b: 204 }),
    );
    expect(c.mode).toBe('rgb');
    expect(c.r).toBeCloseTo(0.2, 2);
    expect(c.g).toBeCloseTo(0.4, 2);
    expect(c.b).toBeCloseTo(0.8, 2);
  });

  it('rgb object carries alpha', () => {
    const c = asColor(
      parseColor({ space: 'rgb', r: 51, g: 102, b: 204, alpha: 0.5 }),
    );
    expect(c.alpha).toBeCloseTo(0.5, 2);
  });

  it('hsl object (% -> 0-1)', () => {
    const c = asColor(
      parseColor({ space: 'hsl', h: 220, s: 60, l: 50 }),
    );
    expect(c.mode).toBe('hsl');
    expect(c.h).toBeCloseTo(220, 0);
    expect(c.s).toBeCloseTo(0.6, 2);
    expect(c.l).toBeCloseTo(0.5, 2);
  });

  it('hwb object (% -> 0-1)', () => {
    const c = asColor(
      parseColor({ space: 'hwb', h: 220, w: 20, b: 20 }),
    );
    expect(c.mode).toBe('hwb');
    expect(c.w).toBeCloseTo(0.2, 2);
    expect(c.b).toBeCloseTo(0.2, 2);
  });

  it('lab object (1:1)', () => {
    const c = asColor(
      parseColor({ space: 'lab', l: 50, a: 40, b: 60 }),
    );
    expect(c.mode).toBe('lab');
    expect(c.l).toBeCloseTo(50, 0);
    expect(c.a).toBeCloseTo(40, 0);
    expect(c.b).toBeCloseTo(60, 0);
  });

  it('lch object (1:1)', () => {
    const c = asColor(
      parseColor({ space: 'lch', l: 50, c: 40, h: 200 }),
    );
    expect(c.mode).toBe('lch');
    expect(c.l).toBeCloseTo(50, 0);
    expect(c.c).toBeCloseTo(40, 0);
    expect(c.h).toBeCloseTo(200, 0);
  });

  it('oklab object (1:1)', () => {
    const c = asColor(
      parseColor({ space: 'oklab', l: 0.5, a: 0.1, b: 0.1 }),
    );
    expect(c.mode).toBe('oklab');
    expect(c.l).toBeCloseTo(0.5, 2);
    expect(c.a).toBeCloseTo(0.1, 2);
    expect(c.b).toBeCloseTo(0.1, 2);
  });

  it('oklch object (1:1)', () => {
    const c = asColor(
      parseColor({ space: 'oklch', l: 0.7, c: 0.1, h: 200 }),
    );
    expect(c.mode).toBe('oklch');
    expect(c.l).toBeCloseTo(0.7, 2);
    expect(c.c).toBeCloseTo(0.1, 2);
    expect(c.h).toBeCloseTo(200, 0);
  });
});

describe('color input — re-wrap of an existing color', () => {
  it('re-wrapping a parsed color preserves it', () => {
    const first = parseColor('#3366cc');
    if (first.kind !== 'color') throw new Error('expected a color');
    const again = asColor(parseColor(first.color));
    expect(again.mode).toBe('rgb');
    expect(again.r).toBeCloseTo(0.2, 2);
    expect(again.b).toBeCloseTo(0.8, 2);
  });

  it('re-wrapping a ResolvedColor round-trips', () => {
    const c = color('#3366cc');
    expect(color(c).css()).toBe(c.css());
  });

  it('re-wrapping a symbolic ResolvedColor keeps the keyword', () => {
    expect(color(color('currentColor')).css()).toBe('currentColor');
  });
});

describe('color input — symbolic keywords pass through to the store', () => {
  const SYMBOLIC = [
    'currentColor',
    'Canvas',
    'CanvasText',
    'Highlight',
    'GrayText',
    'AccentColor',
    'ButtonBorder',
    // deprecated system colors
    'ActiveBorder',
    'ThreeDFace',
    'WindowText',
    // cascade keywords
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
  ];

  for (const keyword of SYMBOLIC) {
    it(`${keyword} -> symbolic store with canonical keyword`, () => {
      expect(asSymbolic(parseColor(keyword))).toBe(keyword);
    });
  }

  it('matches case-insensitively but stores canonical casing', () => {
    expect(asSymbolic(parseColor('CURRENTCOLOR'))).toBe(
      'currentColor',
    );
    expect(asSymbolic(parseColor('canvas'))).toBe('Canvas');
    expect(asSymbolic(parseColor('REVERT-LAYER'))).toBe(
      'revert-layer',
    );
  });
});

describe('color input — lenient: any valid CSS color value is accepted', () => {
  // "if it is a valid CSS color value, we accept it" - even spaces that are
  // output-only / out-of-scope as input (e.g. display-p3). Storage later
  // normalizes them to OKLCH.
  it('accepts a display-p3 color() string', () => {
    expect(() => parseColor('color(display-p3 1 0 0)')).not.toThrow();
    expect(parseColor('color(display-p3 1 0 0)').kind).toBe('color');
  });

  it('accepts a wide-gamut color() string (rec2020)', () => {
    expect(() =>
      parseColor('color(rec2020 0.5 0.2 0.7)'),
    ).not.toThrow();
    expect(parseColor('color(rec2020 0.5 0.2 0.7)').kind).toBe(
      'color',
    );
  });
});

describe('color input — invalid input', () => {
  it('throws on an unparseable string', () => {
    expect(() => parseColor('definitely-not-a-color')).toThrow();
  });
});
