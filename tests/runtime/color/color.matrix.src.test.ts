import {
  blend as blendRef,
  converter,
  formatCss,
  parse,
  wcagContrast,
} from 'culori';
import { describe, expect, it } from 'vitest';

import {
  color,
  colorFormats,
  type ColorInput,
  type ColorObject,
  type ColorSpace,
  type CssFormat,
  parseColor,
  storeColor,
} from '../../../src/color';
import { mDeg } from '../../../src/units/angle';

/*
 * The color book's coverage MATRIX (from color-coverage.md + the modification surface).
 *
 * EMIT axis (make x emit): REAL assertions. Each cell builds a color from a make-form
 * and renders it in an emit format, then round-trips the output back to sRGB and
 * checks it represents the same color (within tolerance). Every make is the same
 * in-gamut, opaque color expressed in each space (named uses rebeccapurple), so no
 * gamut/alpha violations fire here - those are covered in color.output.src.test.ts.
 *
 * MODIFY axis: still real failing placeholders (gap markers, never `it.todo`) - the
 * modification algebra is the next step.
 */

const toRgb = converter('rgb');

/* ---------- axis 1: MAKE (the same in-gamut color in every space) ---------- */
const REF = parse('#3366cc');
if (REF === undefined) throw new Error('ref color failed to parse');
const inSpace = (space: ColorSpace): Record<string, number> =>
  converter(space)(REF) as unknown as Record<string, number>;

const objOf = (space: ColorSpace): ColorObject => {
  const c = inSpace(space);
  switch (space) {
    case 'rgb':
      return { space, r: c.r * 255, g: c.g * 255, b: c.b * 255 };
    case 'hsl':
      return { space, h: c.h ?? 0, s: c.s * 100, l: c.l * 100 };
    case 'hwb':
      return { space, h: c.h ?? 0, w: c.w * 100, b: c.b * 100 };
    case 'lab':
      return { space, l: c.l, a: c.a, b: c.b };
    case 'lch':
      return { space, l: c.l, c: c.c, h: c.h ?? 0 };
    case 'oklab':
      return { space, l: c.l, a: c.a, b: c.b };
    case 'oklch':
      return { space, l: c.l, c: c.c, h: c.h ?? 0 };
  }
};
const strOf = (space: ColorSpace): string =>
  formatCss(converter(space)(REF));

const MAKE: Array<
  [
    string,
    ColorInput,
  ]
> = [
  [
    'named string',
    'rebeccapurple',
  ],
  [
    'hex string',
    '#3366cc',
  ],
  [
    'rgb string',
    strOf('rgb'),
  ],
  [
    'rgb object',
    objOf('rgb'),
  ],
  [
    'hsl string',
    strOf('hsl'),
  ],
  [
    'hsl object',
    objOf('hsl'),
  ],
  [
    'hwb string',
    strOf('hwb'),
  ],
  [
    'hwb object',
    objOf('hwb'),
  ],
  [
    'lab string',
    strOf('lab'),
  ],
  [
    'lab object',
    objOf('lab'),
  ],
  [
    'lch string',
    strOf('lch'),
  ],
  [
    'lch object',
    objOf('lch'),
  ],
  [
    'oklab string',
    strOf('oklab'),
  ],
  [
    'oklab object',
    objOf('oklab'),
  ],
  [
    'oklch string',
    strOf('oklch'),
  ],
  [
    'oklch object',
    objOf('oklch'),
  ],
];

/* ---------- axis 2: EMIT (every output format / colorFormats) ---------- */
const EMIT: Array<
  [
    string,
    CssFormat,
  ]
> = [
  [
    'rgba',
    colorFormats.rgba,
  ],
  [
    'rgb',
    colorFormats.rgb,
  ],
  [
    'hex',
    colorFormats.hex,
  ],
  [
    'hexAlpha',
    colorFormats.hexAlpha,
  ],
  [
    'hsl',
    colorFormats.hsl,
  ],
  [
    'hwb',
    colorFormats.hwb,
  ],
  [
    'lab',
    colorFormats.lab,
  ],
  [
    'lch',
    colorFormats.lch,
  ],
  [
    'oklab',
    colorFormats.oklab,
  ],
  [
    'oklch',
    colorFormats.oklch,
  ],
  [
    'displayP3',
    colorFormats.displayP3,
  ],
];

const refRgb = (input: ColorInput): Record<string, number> => {
  const stored = storeColor(parseColor(input));
  if (stored.kind !== 'color') throw new Error('expected a color');
  return toRgb(stored.color) as unknown as Record<string, number>;
};
const parseRgb = (css: string): Record<string, number> => {
  const parsed = parse(css);
  if (parsed === undefined)
    throw new Error(`unparseable output: ${css}`);
  return toRgb(parsed) as unknown as Record<string, number>;
};

describe('color — make x emit matrix', () => {
  for (const [
    makeLabel,
    input,
  ] of MAKE) {
    describe(`make: ${makeLabel}`, () => {
      const ref = refRgb(input);
      for (const [
        emitLabel,
        format,
      ] of EMIT) {
        it(`emit: ${emitLabel}`, () => {
          const css = color(input).formatAs(format).css();
          const got = parseRgb(css);
          expect(got.r).toBeCloseTo(ref.r, 2);
          expect(got.g).toBeCloseTo(ref.g, 2);
          expect(got.b).toBeCloseTo(ref.b, 2);
        });
      }
    });
  }
});

/* The spec's "plus an alpha case": a translucent color round-trips its alpha through
 * every alpha-capable format. (rgb/hex drop alpha; that path is covered by the
 * violation tests in color.output.src.test.ts.) */
const ALPHA_EMIT = EMIT.filter(
  ([
    emitLabel,
  ]) => emitLabel !== 'rgb' && emitLabel !== 'hex',
);

describe('color — alpha round-trips through alpha-capable formats', () => {
  const translucent = '#3366cc80'; // alpha ~0.502
  const ref = refRgb(translucent);
  for (const [
    emitLabel,
    format,
  ] of ALPHA_EMIT) {
    it(`emit: ${emitLabel} preserves color + alpha`, () => {
      const got = parseRgb(color(translucent).formatAs(format).css());
      expect(got.r).toBeCloseTo(ref.r, 2);
      expect(got.g).toBeCloseTo(ref.g, 2);
      expect(got.b).toBeCloseTo(ref.b, 2);
      expect(got.alpha ?? 1).toBeCloseTo(0.5, 2);
    });
  }
});

/* ---------- axis 3: MODIFY ---------- */
// The core algebra (alpha/darken/lighten/brighten/saturate/desaturate/hueShift/mix/
// mixSolid/mixWithAlpha/solid/clone/chaining) is implemented and tested in
// color.modify.src.test.ts.
//
// The cells below are the (formerly) documented modification gaps from
// color-coverage.md. ALL are now implemented, with expected values DERIVED from culori
// reference functions: the OKLCH-coordinate setters (setLightness/setChroma/setHue/
// complement/contrast) and the four resolved modifiers (invert, grayscale, blend,
// ensureContrast). The design decisions behind the last four are recorded in
// `backlog.typedInputs.md` under "Colour modification gaps (design questions)".

/* The OKLCH store is the working space; setters write a coordinate directly and the
 * value round-trips losslessly (oklch -> oklch normalize is identity). Expected
 * values are read straight off culori's oklch converter, not off the implementation. */
const oklch = converter('oklch');
const baseOklch = oklch(parse('#3366cc')) as unknown as Record<
  string,
  number
>;

describe('color — modification gaps (filled, culori-derived)', () => {
  it('setLightness sets the OKLCH L coordinate absolutely', () => {
    const got = oklch(
      parse(color('#3366cc').setLightness(0.42).oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.l).toBeCloseTo(0.42, 4);
  });

  it('setChroma sets the OKLCH C coordinate absolutely', () => {
    const got = oklch(
      parse(color('#3366cc').setChroma(0.08).oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.c).toBeCloseTo(0.08, 4);
  });

  it('setHue sets the OKLCH H coordinate absolutely (wrapped)', () => {
    const got = oklch(
      parse(color('#3366cc').setHue(mDeg(120)).oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.h).toBeCloseTo(120, 1);
  });

  it('complement rotates the OKLCH hue by 180 degrees', () => {
    const got = oklch(
      parse(color('#3366cc').complement().oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.h).toBeCloseTo((baseOklch.h + 180) % 360, 1);
  });

  it('contrast returns the WCAG ratio (culori wcagContrast as the reference)', () => {
    expect(color('#3366cc').contrast('white')).toBeCloseTo(
      wcagContrast(parse('#3366cc')!, parse('white')!),
      4,
    );
    expect(color('black').contrast('white')).toBeCloseTo(21, 4);
  });
});

// The former-deferred modifiers, now resolved and implemented. Each had a recorded
// design decision (see backlog.typedInputs.md):
//   - invert / grayscale: OKLCH coordinate semantics (perceptual), not an sRGB matrix.
//   - blend: separable blend modes are sRGB-defined channel formulas, so they run in
//     sRGB (storage stays OKLCH); modes are a typed union.
//   - ensureContrast: adjust THIS colour's OKLCH lightness toward black/white until the
//     WCAG ratio is met (default 4.5 = AA), best-achievable if unreachable.
// Expected values are DERIVED from culori reference functions, never read off the impl.

describe('color — invert (OKLCH lightness)', () => {
  it('invert() flips OKLCH lightness (L -> 1 - L), keeping chroma + hue', () => {
    const got = oklch(
      parse(color('#3366cc').invert().oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.l).toBeCloseTo(1 - baseOklch.l, 4);
    expect(got.c).toBeCloseTo(baseOklch.c, 4);
    expect(got.h).toBeCloseTo(baseOklch.h, 1);
  });

  it('invert(0) is a no-op', () => {
    const got = oklch(
      parse(color('#3366cc').invert(0).oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.l).toBeCloseTo(baseOklch.l, 4);
  });

  it('invert(0.5) interpolates to the lightness midpoint (0.5)', () => {
    const got = oklch(
      parse(color('#3366cc').invert(0.5).oklch().css()),
    ) as unknown as Record<string, number>;
    // L + ((1 - L) - L) * 0.5 === 0.5 for any L.
    expect(got.l).toBeCloseTo(0.5, 4);
  });

  it('invert is immutable (original is untouched)', () => {
    const base = color('#3366cc');
    base.invert();
    const got = oklch(parse(base.oklch().css())) as unknown as Record<
      string,
      number
    >;
    expect(got.l).toBeCloseTo(baseOklch.l, 4);
  });
});

describe('color — grayscale (OKLCH chroma)', () => {
  it('grayscale() drops OKLCH chroma to zero, keeping L', () => {
    const got = oklch(
      parse(color('#3366cc').grayscale().oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.c).toBeCloseTo(0, 4);
    expect(got.l).toBeCloseTo(baseOklch.l, 4);
  });

  it('grayscale(0.5) halves the OKLCH chroma', () => {
    const got = oklch(
      parse(color('#3366cc').grayscale(0.5).oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.c).toBeCloseTo(baseOklch.c * 0.5, 4);
    expect(got.l).toBeCloseTo(baseOklch.l, 4);
  });

  it('grayscale(0) is a no-op', () => {
    const got = oklch(
      parse(color('#3366cc').grayscale(0).oklch().css()),
    ) as unknown as Record<string, number>;
    expect(got.c).toBeCloseTo(baseOklch.c, 4);
  });
});

describe('color — blend (separable modes, sRGB)', () => {
  // `lime` is the pure (0,255,0) green; CSS `green` is the darker #008000.
  it('multiply of red and lime is black', () => {
    const got = parseRgb(
      color('red').blend('lime', 'multiply').rgb().css(),
    );
    expect(got.r).toBeCloseTo(0, 2);
    expect(got.g).toBeCloseTo(0, 2);
    expect(got.b).toBeCloseTo(0, 2);
  });

  it('screen of red and lime is yellow', () => {
    const got = parseRgb(
      color('red').blend('lime', 'screen').rgb().css(),
    );
    expect(got.r).toBeCloseTo(1, 2);
    expect(got.g).toBeCloseTo(1, 2);
    expect(got.b).toBeCloseTo(0, 2);
  });

  const BLEND_MODES = [
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
  ] as const;

  // The store is OKLCH, so the reference blends the same OKLCH-round-tripped operands
  // culori sees (eliminates a spurious hex->oklch->rgb delta), in sRGB ('rgb').
  const baseOk = oklch(parse('#3366cc'))!;
  const targOk = oklch(parse('#cc6633'))!;
  for (const mode of BLEND_MODES) {
    it(`${mode} matches the culori sRGB blend reference`, () => {
      const ref = toRgb(
        blendRef(
          [
            baseOk,
            targOk,
          ],
          mode,
          'rgb',
        ),
      ) as unknown as Record<string, number>;
      const got = parseRgb(
        color('#3366cc').blend('#cc6633', mode).rgb().css(),
      );
      expect(got.r).toBeCloseTo(ref.r, 2);
      expect(got.g).toBeCloseTo(ref.g, 2);
      expect(got.b).toBeCloseTo(ref.b, 2);
    });
  }
});

describe('color — ensureContrast (WCAG via OKLCH lightness)', () => {
  it('raises contrast to >= 4.5 against white (darkens)', () => {
    const out = color('#777777').ensureContrast('white');
    expect(out.contrast('white')).toBeGreaterThanOrEqual(4.5 - 1e-6);
    const got = oklch(parse(out.oklch().css())) as unknown as Record<
      string,
      number
    >;
    const orig = oklch(parse('#777777')) as unknown as Record<
      string,
      number
    >;
    // against white, the way to gain contrast is to get darker.
    expect(got.l).toBeLessThan(orig.l);
  });

  it('reaches the AAA ratio (7) when achievable', () => {
    const out = color('#888888').ensureContrast('white', 7);
    expect(out.contrast('white')).toBeGreaterThanOrEqual(7 - 1e-6);
  });

  it('already-sufficient contrast is returned unchanged', () => {
    const out = color('black').ensureContrast('white');
    expect(out.contrast('white')).toBeCloseTo(21, 4);
  });

  it('unreachable ratio yields the best-achievable (max-contrast) colour', () => {
    // white vs white can never reach 21; pushing toward black maxes out near 21.
    const out = color('white').ensureContrast('white', 21);
    expect(out.contrast('white')).toBeGreaterThan(15);
  });
});
