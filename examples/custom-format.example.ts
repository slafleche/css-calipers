/**
 * Example-only file. Not part of the public API surface and not published.
 *
 * IMPORTANT: the "zoo" format is NOT a serious or proposed colour type, and not a
 * recommendation. It is a deliberately silly example whose ONLY purpose is to show the
 * EXTENSIBILITY of the system: that any custom format, even a nonsensical animal-name
 * one, can plug into the colour pipeline end to end. Do not copy it as a real format.
 *
 * What it actually demonstrates: a custom colour FORMAT registered via `createColor` +
 * `defineColorSpace`. A plugin extends the pipeline at BOTH edges (input bridge +
 * output render) while storage stays canonical OKLCH. You "think" in animal names
 * (flamingo, blackPanther, whiteFox), each anchored to a real CSS colour: the input
 * bridge maps a name to its colour, and the render quantizes any stored colour back to
 * the nearest animal's real CSS value, so `flamingo` renders as the word `pink`, not
 * the literal `flamingo`.
 */

import {
  type ColorConfig,
  type ColorFormatPlugin,
  colorFormats,
  type ColorString,
  createColor,
} from '@css-bookends/css-calipers';
import { type Color, converter, parse as parseCulori } from 'culori';

// The same rgb conversion primitive the built-in `rgb` descriptor uses: convert the
// stored OKLCH colour to rgb, then quantize to the nearest animal.
const toRgb = converter('rgb');

// The palette: each animal is anchored to a real CSS colour (and its rgb in 0..1, so
// the render can measure nearest-distance to quantize an arbitrary colour).
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

// The INPUT bridge: an animal name maps to its anchor colour, which culori parses
// into a `Color`. Anything that is not an animal name declines (returns `undefined`),
// so the built-in parser keeps every input it already handled.
const ZOO_NAMES = {
  flamingo: 'pink',
  blackPanther: 'black',
  whiteFox: 'white',
} as const;

// The full plugin: a descriptor (render + fidelity + browser bits) that ALSO bridges
// the input edge. It is unbounded + alpha, so it fits any colour and can sit at the
// head of a priority list.
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
  render: (c: Color, _cfg: ColorConfig): ColorString<'zoo'> =>
    nearestAnimalCss(
      toRgb(c).r,
      toRgb(c).g,
      toRgb(c).b,
    ) as ColorString<'zoo'>,
};

// Bind an instance to the plugin. The instance parser tries the built-ins first,
// then the plugin; the plugin is a valid output descriptor too.
const myColor = createColor({
  formats: [
    zoo,
  ],
});

// --- input bridge: an animal name parses, then renders through zoo ---------------

// 'flamingo' is not a CSS colour, so the built-ins decline and the zoo plugin claims
// it (-> the anchor 'pink'), then renders back through zoo to the word 'pink'.
export const flamingo = myColor('flamingo').formatAs(zoo).css(); // 'pink'

// --- the typed named selector (.zoo) --------------------------------------------

// Each registered plugin gets a typed lazy selector. A built-in input still parses
// normally (a plugin only claims inputs the built-ins reject); #000000 quantizes to
// the nearest animal, blackPanther, which renders as 'black'.
export const black = myColor('#000000').zoo.css(); // 'black'
export const white = myColor('#ffffff').zoo.css(); // 'white'

// --- the format in the output priority list -------------------------------------

// zoo fits any colour (unbounded + alpha), so it wins the head of the list; 'pink' is
// the flamingo anchor exactly, and renders as the real value 'pink'.
export const fromPriority = myColor('pink', {
  output: [
    zoo,
    colorFormats.oklch,
  ],
}).css(); // 'pink'

// The per-instance registry exposes built-ins plus the plugin, keyed by format name.
export const zooIsRegistered = myColor.formats.zoo === zoo; // true
