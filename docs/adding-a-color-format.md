# Adding a colour format

A step-by-step guide to adding a custom colour format end to end: input parsing,
output rendering, registration, and use. The running example is `zoo`, a whimsical
but real format where you think in animal names (`flamingo`, `blackPanther`,
`whiteFox`) and each one is anchored to a real CSS colour. The same recipe applies to
any real format you want to bolt on.

## Mental model

Storage is canonical OKLCH and is NOT pluggable: every modification (`darken`,
`mix`, `setHue`, ...) operates in OKLCH, so a colour is always normalized to OKLCH in
the storage step. A plugin instead bridges the EDGES of the pipeline. It enters the
core at INPUT through `parse` (your format's string becomes a culori colour, which
`storeColor` normalizes to OKLCH) and leaves the core at OUTPUT through `render`
(OKLCH out to your format's CSS string). You wire the plugin in through the
`createColor` factory, which binds a per-instance registry and a plugin-aware parser.

## Step 1: author the plugin

A plugin is a `ColorFormatPlugin`: a full output descriptor
(`ColorSpaceDescriptor`) plus an optional `parse` input bridge.

```ts
export interface ColorFormatPlugin<F extends string = string>
  extends ColorSpaceDescriptor<F> {
  parse?: (input: string) => Color | undefined;
}
```

The required descriptor fields (all from `ColorSpaceDescriptor`):

- `format`: the format's key string (e.g. `'zoo'`). It keys the plugin in the
  per-instance registry, names the typed selector (`.zoo`), and brands the output
  (`ColorString<'zoo'>`).
- `render(color, cfg)`: render a stored OKLCH colour to this format's CSS value
  string. This is the OUTPUT bridge. Convert out of OKLCH with culori (e.g.
  `converter('rgb')`) and serialize.
- `hasAlpha`: fidelity bit, read by output escalation. Whether the format can carry
  an alpha channel.
- `gamut`: fidelity bit, read by output escalation. One of `'srgb'`, `'p3'`,
  `'unbounded'` (widening `srgb` is a subset of `p3` is a subset of `unbounded`).
- `supportsProbe`: browser bit, read by the gilding fallback seam. The `@supports`
  test string that detects parse-support (e.g. `'(color: oklch(0 0 0))'`), or `null`
  for a universally-supported format.
- `gamutDependent`: browser bit, read by the gilding fallback seam. Whether a
  fallback should also gate on `@media (color-gamut: ...)` (true for `display-p3`,
  false for syntax-only modern formats like `oklch`).
- `srgbFloor`: browser bit, read by the gilding fallback seam. Whether this is a safe
  sRGB floor where the fallback chain can stop.

The optional `parse` field is the INPUT bridge:

- `parse(input)`: recognize this format's input string and return a culori `Color`,
  or `undefined` to decline. `storeColor` then normalizes the returned colour to
  OKLCH. Declining lets the next plugin (then the built-in parser) try. Built-in parse
  precedence is intact: a plugin only ever claims a string the built-ins reject (e.g.
  `'flamingo'`). Omit `parse` for an output-only format.

Two readers consume these fields, which is why they are split:

- Output escalation reads `hasAlpha` and `gamut` to pick the simplest format that
  faithfully holds a colour when you pass a priority list.
- The gilding fallback seam reads `supportsProbe`, `gamutDependent`, and `srgbFloor`
  to assemble multi-declaration browser fallbacks. This seam is in progress (see the
  note at the end).

## Step 2: register it

Register one or more plugins through the `createColor` factory. It returns a
`color()`-shaped function bound to a per-instance registry (built-ins plus your
plugins) and a plugin-aware parser.

```ts
const myColor = createColor({ formats: [zoo] });
```

The worked `zoo` plugin, verbatim-consistent with the custom-format test:

```ts
import type { Color } from 'culori';
import { converter, parse as parseCulori } from 'culori';

import {
  type ColorConfig,
  type ColorFormatPlugin,
  type ColorString,
  createColor,
} from '../../../src/color';

// The same rgb conversion primitive the built-in `rgb` descriptor uses.
const toRgb = converter('rgb');

const ZOO_PALETTE = [
  { name: 'flamingo', css: 'pink', rgb: [1, 0.7529, 0.7961] }, // #ffc0cb
  { name: 'blackPanther', css: 'black', rgb: [0, 0, 0] }, // #000000
  { name: 'whiteFox', css: 'white', rgb: [1, 1, 1] }, // #ffffff
] as const;

// Quantize a colour to the nearest animal, returning that animal's real CSS value.
const nearestAnimalCss = (r: number, g: number, b: number): string => {
  let best: string = ZOO_PALETTE[0].css;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const animal of ZOO_PALETTE) {
    const [ar, ag, ab] = animal.rgb;
    const dist = (r - ar) ** 2 + (g - ag) ** 2 + (b - ab) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = animal.css;
    }
  }
  return best;
};

// The INPUT bridge: an animal name maps to its anchor colour, which culori parses
// into a `Color`. Anything that is not an animal name declines (returns `undefined`).
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
    return nearestAnimalCss(rgb.r, rgb.g, rgb.b) as ColorString<'zoo'>;
  },
};

const myColor = createColor({ formats: [zoo] });
```

For an output-only format (no input bridge), author the descriptor with
`defineColorSpace` and pass it where an `OutputFormat` is accepted, or register it as
a plugin without a `parse` field.

## Step 3: use it

Three ways to use a registered format:

1. Input bridge. The plugin's `parse` claims the animal name, which normalizes to
   OKLCH, then renders back through the plugin (`.formatAs(zoo)` sets the custom
   output format; `.css()` itself takes no argument):
   ```ts
   myColor('flamingo').formatAs(zoo).css(); // 'pink'
   ```
2. Typed named selector. The factory exposes a typed lazy selector per plugin format
   (`.zoo`), returning this colour reconfigured to render through the plugin:
   ```ts
   myColor('#000000').zoo.css(); // 'black'
   ```
3. Output priority list. A plugin is a valid `output` entry; the engine resolves it
   from the passed object, not a registry name lookup. `zoo` is unbounded plus alpha,
   so it fits any colour and wins the head of the list:
   ```ts
   myColor('pink', { output: [zoo, colorFormats.oklch] }).css(); // 'pink'
   ```

Registration is scoped per instance. The module-level `color` (which is
`createColor({ formats: [] })`) does not see custom formats, so `color('flamingo')`
throws `color: unparseable color string "flamingo"`. The instance registry is exposed
on `myColor.formats` (built-ins plus your plugins), e.g. `myColor.formats.zoo === zoo`
and `myColor.formats.hex === colorFormats.hex`.

## Step 4: transparency and config interplay

- The `transparent` config (`'keyword'` by default, also `'white'`, `'black'`,
  `'preserve'`) sets how a fully-transparent colour (alpha 0) renders for any output.
- `.transparentAs(mode)` overrides that policy for one result, winning over the
  configured default; the output format threads through unchanged, so it composes with
  the format selectors in any order.

## Gilding fallback note

The per-instance registry (`myColor.formats`) is exposed so a gilding composing-core
can read each descriptor's `supportsProbe`, `gamutDependent`, and `srgbFloor` and emit
multi-declaration browser fallbacks before Lightning CSS, which cannot fall back a
token it does not recognize. The registry-aware fallback is in progress, not done; see
`packages/gilding/src/cores/compose.ts` and the design doc
`lexicons/calipers/docs/custom-format-registration.md` (the "Gilding fallback seam"
section).
