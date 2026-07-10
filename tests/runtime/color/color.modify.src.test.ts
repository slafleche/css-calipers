import { converter, parse } from 'culori';
import { describe, expect, it } from 'vitest';

import { color, type ResolvedColor } from '../../../src/color';
import { mDeg } from '../../../src/units/angle';

/*
 * MODIFY step: the immutable modification algebra. Amounts are 0..1 fractions,
 * relative (toward the extreme), applied in OKLCH; each modification returns a NEW
 * resolved color. Real assertions (no `it.todo`). The documented gaps (setLightness,
 * contrast, complement, invert, grayscale) and `blend` remain pending in the matrix.
 */
const oklchOf = (rc: ResolvedColor): Record<string, number> =>
  converter('oklch')(parse(rc.oklch().css())) as unknown as Record<
    string,
    number
  >;

describe('color modify — alpha', () => {
  it('alpha() returns the current alpha', () => {
    expect(color('#3366cc80').alpha()).toBeCloseTo(0.5, 2);
  });
  it('alpha(v) returns a new color with that alpha', () => {
    expect(color('#3366cc').alpha(0.5).rgba().css()).toBe(
      'rgba(51, 102, 204, 0.5)',
    );
  });
});

describe('color modify — lightness', () => {
  const base = oklchOf(color('#3366cc'));
  it('darken lowers L', () => {
    expect(oklchOf(color('#3366cc').darken(0.2)).l).toBeLessThan(
      base.l,
    );
  });
  it('lighten raises L', () => {
    expect(oklchOf(color('#3366cc').lighten(0.2)).l).toBeGreaterThan(
      base.l,
    );
  });
  it('brighten is an alias of lighten', () => {
    expect(color('#3366cc').brighten(0.2).oklch().css()).toBe(
      color('#3366cc').lighten(0.2).oklch().css(),
    );
  });
});

describe('color modify — chroma', () => {
  const base = oklchOf(color('#3366cc'));
  it('saturate raises C', () => {
    expect(oklchOf(color('#3366cc').saturate(0.5)).c).toBeGreaterThan(
      base.c,
    );
  });
  it('desaturate lowers C', () => {
    expect(oklchOf(color('#3366cc').desaturate(0.5)).c).toBeLessThan(
      base.c,
    );
  });
});

describe('color modify — hueShift', () => {
  it('rotates the hue by the given degrees', () => {
    const base = oklchOf(color('#3366cc'));
    const shifted = oklchOf(color('#3366cc').hueShift(mDeg(90)));
    expect(shifted.h).toBeCloseTo((base.h + 90) % 360, 0);
  });
});

describe('color modify — mix', () => {
  it('mixes halfway by default', () => {
    const mid = oklchOf(color('white').mix('black'));
    expect(mid.l).toBeGreaterThan(0.2);
    expect(mid.l).toBeLessThan(0.85);
  });
  it('ratio 0 keeps the base color', () => {
    expect(color('red').mix('blue', 0).oklch().css()).toBe(
      color('red').oklch().css(),
    );
  });
  it('mixSolid yields an opaque result', () => {
    expect(color('#3366cc80').mixSolid('red').alpha()).toBe(1);
  });
  it('mixWithAlpha sets the result alpha', () => {
    expect(
      color('#3366cc').mixWithAlpha('red', 0.5, 0.3).alpha(),
    ).toBeCloseTo(0.3, 2);
  });
});

describe('color modify — solid / clone', () => {
  it('solid forces the alpha to 1', () => {
    expect(color('#3366cc80').solid().alpha()).toBe(1);
  });
  it('clone renders identically', () => {
    expect(color('#3366cc').clone().css()).toBe(
      color('#3366cc').css(),
    );
  });
});

describe('color modify — immutability + chaining', () => {
  it('chains darken -> alpha -> css without mutating the source', () => {
    const c = color('#3366cc');
    const chained = c.darken(0.2).alpha(0.5).rgba().css();
    expect(chained).toMatch(/^rgba\(\d+, \d+, \d+, 0\.5\)$/);
    expect(c.css()).toBe('#3366cc'); // original untouched (default escalates to hex)
  });
});

/*
 * #35 contrast AFTER a modification. `contrast` is a terminal reading the OKLCH store
 * via culori `wcagContrast`; existing tests only exercise it on fresh colours. Darkening
 * #3366cc (a mid-tone blue) moves it away from white, so its WCAG ratio against white
 * must RISE, stay in the valid 1..21 band, and exceed the un-darkened ratio.
 */
describe('color modify — contrast after a modification', () => {
  it('contrast after darken returns a sensible ratio in [1, 21]', () => {
    const ratio = color('#3366cc').darken(0.2).contrast('white');
    expect(ratio).toBeGreaterThanOrEqual(1);
    expect(ratio).toBeLessThanOrEqual(21);
  });

  it('darkening a colour raises its contrast against white', () => {
    const base = color('#3366cc').contrast('white');
    const darkened = color('#3366cc').darken(0.2).contrast('white');
    expect(darkened).toBeGreaterThan(base);
  });

  it('lightening a colour lowers its contrast against white', () => {
    const base = color('#3366cc').contrast('white');
    const lightened = color('#3366cc').lighten(0.2).contrast('white');
    expect(lightened).toBeLessThan(base);
  });
});

/*
 * #35 brighten rendered THROUGH a format. brighten is an alias of lighten; existing
 * coverage only asserts that alias-equality, never a real render. Render it through
 * rgba and confirm it produces a well-formed, opaque rgba string.
 */
describe('color modify — brighten renders through a format', () => {
  it('brighten().rgba().css() yields a well-formed rgba string', () => {
    expect(color('#3366cc').brighten(0.2).rgba().css()).toMatch(
      /^rgba\(\d+, \d+, \d+, 1\)$/,
    );
  });

  it('brighten().rgba().css() matches lighten().rgba().css() (alias holds under render)', () => {
    expect(color('#3366cc').brighten(0.2).rgba().css()).toBe(
      color('#3366cc').lighten(0.2).rgba().css(),
    );
  });
});
