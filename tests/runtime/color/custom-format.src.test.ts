import type { Color } from 'culori';
import { converter, parse as parseCulori } from 'culori';
import { describe, expect, it } from 'vitest';

import {
  color,
  type ColorConfig,
  type ColorFormatPlugin,
  colorFormats,
  type ColorString,
  createColor,
  defineColorSpace,
} from '../../../src/color';
import { mDeg } from '../../../src/units/angle';

/*
 * GOAL B: a user-defined custom format (authored via `defineColorSpace`) must work
 * end-to-end. The engine resolves an `output` entry from the passed descriptor
 * object, NOT by a name lookup in the built-in registry, so a custom-named descriptor
 * both renders (`.css()`) and participates in escalation (`fits()` reads its fidelity
 * bits). These tests would crash before the resolver fix: `colorFormats['rgbPercent']`
 * is `undefined`.
 *
 * We render the same way the built-in sRGB descriptors do: convert the stored OKLCH
 * color to rgb (culori `converter('rgb')`), then format the channels, here as
 * percentages, mirroring the `rgb(R% G% B%)` modern syntax.
 */

// The same rgb conversion primitive the built-in `rgb` descriptor uses.
const toRgb = converter('rgb');

// A 0..1 channel rendered as a percentage token (e.g. 0.2 -> "20%"), 1dp.
const channelPct = (value: number): string => {
  const clamped = Math.min(1, Math.max(0, value));
  return `${Math.round(clamped * 1000) / 10}%`;
};

// A believable custom format: sRGB gamut, no alpha, rgb-as-percent rendering.
const rgbPercent = defineColorSpace({
  format: 'rgbPercent',
  hasAlpha: false,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (
    c: Color,
    _cfg: ColorConfig,
  ): ColorString<'rgbPercent'> => {
    const rgb = toRgb(c);
    return `rgb(${channelPct(rgb.r)} ${channelPct(rgb.g)} ${channelPct(rgb.b)})` as ColorString<'rgbPercent'>;
  },
});

// An alpha-capable sibling, to prove escalation honours fidelity, not a name.
const rgbPercentAlpha = defineColorSpace({
  format: 'rgbPercentAlpha',
  hasAlpha: true,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (
    c: Color,
    _cfg: ColorConfig,
  ): ColorString<'rgbPercentAlpha'> => {
    const rgb = toRgb(c);
    const alpha = Math.round((c.alpha ?? 1) * 1000) / 1000;
    return `rgb(${channelPct(rgb.r)} ${channelPct(rgb.g)} ${channelPct(rgb.b)} / ${alpha})` as ColorString<'rgbPercentAlpha'>;
  },
});

describe('custom format — defineColorSpace works end-to-end', () => {
  it('formatAs(customDescriptor) renders the custom output', () => {
    expect(color('#3366cc').formatAs(rgbPercent).css()).toBe(
      'rgb(20% 40% 80%)',
    );
  });

  it('configured single: { output: customDescriptor } renders it', () => {
    expect(color('#3366cc', { output: rgbPercent }).css()).toBe(
      'rgb(20% 40% 80%)',
    );
  });

  it('alpha-capable custom format renders its alpha slot', () => {
    expect(
      color('#3366cc80', { output: rgbPercentAlpha }).css(),
    ).toBe('rgb(20% 40% 80% / 0.502)');
  });
});

describe('custom format — escalation reads the custom descriptor fidelity', () => {
  it('opaque sRGB picks the no-alpha custom format', () => {
    expect(
      color('#3366cc', {
        output: [
          rgbPercent,
          colorFormats.oklch,
        ],
      }).css(),
    ).toBe('rgb(20% 40% 80%)');
  });

  it('an alpha color SKIPS the no-alpha custom and lands on oklch', () => {
    expect(
      color('#3366cc80', {
        output: [
          rgbPercent,
          colorFormats.oklch,
        ],
      }).css(),
    ).toMatch(/^oklch\(.+ \/ 0\.502\)$/);
  });
});

/*
 * The onion's point: calipers is the foundation layer, open at the edges. This `zoo`
 * format is a whimsical-but-real colour space: you think in animals (flamingo,
 * blackPanther, whiteFox), each anchored to a real colour. The render quantizes any
 * colour to the nearest animal and emits THAT animal's real CSS value, so `flamingo`
 * renders as `pink`, not the word "flamingo". The output is valid CSS. It is unbounded
 * + alpha, so it fits any colour and can sit at the head of a priority list, and the
 * render receives the real stored colour, so a different input lands on a different
 * animal.
 */
const ZOO_PALETTE = [
  {
    name: 'flamingo',
    css: 'pink',
    rgb: [
      1,
      0.7529,
      0.7961,
    ],
  }, // #ffc0cb
  {
    name: 'blackPanther',
    css: 'black',
    rgb: [
      0,
      0,
      0,
    ],
  }, // #000000
  {
    name: 'whiteFox',
    css: 'white',
    rgb: [
      1,
      1,
      1,
    ],
  }, // #ffffff
] as const;

// Quantize a colour to the nearest animal, returning that animal's real CSS value.
const nearestAnimalCss = (
  r: number,
  g: number,
  b: number,
): string => {
  let best: string = ZOO_PALETTE[0].css;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const animal of ZOO_PALETTE) {
    const [
      ar,
      ag,
      ab,
    ] = animal.rgb;
    const dist = (r - ar) ** 2 + (g - ag) ** 2 + (b - ab) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = animal.css;
    }
  }
  return best;
};

// The INPUT bridge: an animal NAME maps to its anchor colour, which culori parses
// into a `Color`. Anything that is not an animal name declines (returns `undefined`),
// so the built-in parser keeps every input it already handled.
const ZOO_NAMES = {
  flamingo: 'pink',
  blackPanther: 'black',
  whiteFox: 'white',
} as const;

const zoo: ColorFormatPlugin<'zoo'> = {
  format: 'zoo',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: false,
  // input: bridge an animal name to its culori colour; decline anything else.
  parse: (input: string): Color | undefined =>
    input in ZOO_NAMES
      ? parseCulori(ZOO_NAMES[input as keyof typeof ZOO_NAMES])
      : undefined,
  // output: quantize the stored OKLCH colour to the nearest animal's CSS word.
  render: (c: Color, _cfg: ColorConfig): ColorString<'zoo'> => {
    const rgb = toRgb(c);
    return nearestAnimalCss(
      rgb.r,
      rgb.g,
      rgb.b,
    ) as ColorString<'zoo'>;
  },
};

describe('custom format — a whimsical "zoo" colour format proves the foundation is open', () => {
  it('goes through as the chosen entry in the priority list (flamingo -> pink)', () => {
    // zoo fits any colour (unbounded + alpha), so it wins the head of the list.
    // pink is the flamingo anchor exactly, and renders as the real value 'pink'.
    expect(
      color('pink', {
        output: [
          zoo,
          colorFormats.oklch,
        ],
      }).css(),
    ).toBe('pink');
  });

  it('formatAs(zoo) routes through the made-up format too', () => {
    expect(color('#000000').formatAs(zoo).css()).toBe('black');
  });

  it('render receives the real stored colour (a different colour differs)', () => {
    // whiteFox -> 'white', blackPanther -> 'black': proof the colour flows through.
    expect(color('#ffffff').formatAs(zoo).css()).toBe('white');
    expect(color('#000000').formatAs(zoo).css()).toBe('black');
  });
});

/*
 * The full round trip: `zoo` registered as a PLUGIN through `createColor` extends the
 * pipeline at BOTH edges. An animal name enters via the plugin's `parse`, normalizes to
 * the canonical OKLCH store, and renders back out through the plugin's `render`. The
 * registration is scoped to the instance: the module-level `color` (no zoo) does not
 * accept an animal name.
 */
describe('custom format — zoo as a full INPUT + OUTPUT plugin (round trip)', () => {
  const myColor = createColor({
    formats: [
      zoo,
    ],
  });

  it('input bridge: an animal name parses, then renders through zoo', () => {
    expect(myColor('flamingo').formatAs(zoo).css()).toBe('pink');
  });

  it('named selector: .zoo reconfigures output to the zoo descriptor', () => {
    expect(myColor('#000000').zoo.css()).toBe('black');
  });

  it('config priority: zoo at the head of the output list wins', () => {
    expect(
      myColor('pink', {
        output: [
          zoo,
          colorFormats.oklch,
        ],
      }).css(),
    ).toBe('pink');
  });

  it('built-in inputs still parse normally on a zoo instance', () => {
    // a plugin only claims inputs the built-ins reject; #000000 stays built-in.
    expect(myColor('#000000').formatAs(zoo).css()).toBe('black');
    expect(myColor('#ffffff').formatAs(zoo).css()).toBe('white');
  });

  it('per-instance scoping: the module-level color does NOT accept an animal name', () => {
    // no zoo registered on `color`, so the built-in parser rejects the string.
    expect(() => color('flamingo')).toThrow(
      'color: unparseable color string "flamingo"',
    );
  });

  it('the per-instance registry exposes built-ins plus the plugin', () => {
    expect(myColor.formats.zoo).toBe(zoo);
    expect(myColor.formats.hex).toBe(colorFormats.hex);
  });
});

/*
 * #26 + #27: a custom-format `createColor` instance is the SAME colour primitive at
 * the edges, so it must carry the WHOLE colour surface, not just `.formatAs` / `.zoo`
 * / `.css()`. A custom-parsed input normalizes to the canonical OKLCH store, so every
 * modify (`darken`, `mix`, `setHue`, `alpha`, `transparentAs`) and every built-in
 * selector (`.rgba()`, `.hex()`, `.oklch()`, ...) must work on the instance result,
 * exactly as on the module-level `color`.
 */
describe('custom format — a createColor instance carries the full colour surface', () => {
  const myColor = createColor({
    formats: [
      zoo,
    ],
  });

  it('modify-then-render: darken a custom-parsed colour and emit rgba', () => {
    // 'flamingo' parses through the zoo bridge to pink, normalizes to OKLCH, so a
    // lightness edit (darken) is a real coordinate change. We assert structural
    // facts, not a hand-computed magic value: it is a valid `rgba(...)` string and
    // it DIFFERS from the same colour rendered without the darken.
    const base = myColor('flamingo').rgba().css();
    const darkened = myColor('flamingo').darken(0.2).rgba().css();
    expect(darkened.startsWith('rgba(')).toBe(true);
    expect(darkened).not.toBe(base);
  });

  it('modify-then-render: a mix / setHue chain produces a valid, changed render', () => {
    // mix toward white, then rotate the hue: both are OKLCH-store edits and must
    // round-trip out through a built-in format. Assert it is a real rgba string and
    // that the chain moved the colour away from the untouched flamingo render.
    const base = myColor('flamingo').rgba().css();
    const chained = myColor('flamingo')
      .mix('white', 0.3)
      .setHue(mDeg(200))
      .rgba()
      .css();
    expect(chained.startsWith('rgba(')).toBe(true);
    expect(chained).not.toBe(base);
  });

  it('exposes the full modify + selector surface (not only formatAs/zoo/css)', () => {
    const c = myColor('flamingo');
    // modifiers
    expect(typeof c.darken).toBe('function');
    expect(typeof c.lighten).toBe('function');
    expect(typeof c.mix).toBe('function');
    expect(typeof c.transparentAs).toBe('function');
    expect(typeof c.alpha).toBe('function');
    // built-in format selectors
    expect(typeof c.hex).toBe('function');
    expect(typeof c.oklch).toBe('function');
  });

  it('#27: alpha(0) + transparentAs("white") renders the white-substitute policy', () => {
    // alpha 0 with the `white` transparency policy substitutes an alpha-0 white,
    // which the default priority renders through rgba as `rgba(255, 255, 255, 0)`.
    // This was only ever proven on the module-level `color`; here it runs on a
    // createColor instance built from a custom-parsed input.
    const rendered = myColor('flamingo')
      .alpha(0)
      .transparentAs('white')
      .css();
    expect(rendered).toMatch(/^rgba\(255, 255, 255, 0(\.0+)?\)$/);
  });

  it('#27: the same alpha-0 policy matches the module-level color behaviour', () => {
    // parity check: a built-in input on the instance lands on the identical render
    // as the module-level color, proving the policy is instance-independent.
    const onInstance = myColor('#3366cc')
      .alpha(0)
      .transparentAs('white')
      .css();
    const onModule = color('#3366cc')
      .alpha(0)
      .transparentAs('white')
      .css();
    expect(onInstance).toBe(onModule);
    expect(onInstance).toMatch(/^rgba\(255, 255, 255, 0(\.0+)?\)$/);
  });
});
