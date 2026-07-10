# Color output formats: the registry + fidelity escalation

This folder holds one descriptor per supported CSS color format (`<name>/<name>.ts`),
plus the shared render toolkit (`internals.ts`) and the descriptor contract
(`types.ts`, with `defineColorSpace` for custom formats).

A descriptor knows how to **render** its format from the canonical OKLCH store, and
carries two kinds of metadata: **fidelity** bits the color book reads to choose its
single output, and **browser** bits a separate fallback helper reads to assemble
multi-declaration fallbacks. This doc is the design; the pure-spec value surface is
`../../color-space.md`.

## Output is hardened to its format

Each descriptor's `render` returns a `ColorString<F>` (a `CssColor` branded with the
format name). So calling a specific format selector hardens the type to that format:
`color(x).hex().css()` is a `ColorString<'hex'>`, `color(x).oklch().css()` is a
`ColorString<'oklch'>`, not an interchangeable plain string. This is the project's
"runtime restriction also hardens the type" rule applied to output. The default
`.css()` (the runtime escalation list) stays a generic `CssColor`, since which format
wins is decided at runtime by the color's gamut and alpha.

## The eleven formats

| format | alpha | gamut | precision |
| --- | --- | --- | --- |
| `hex` | no | sRGB | 8-bit |
| `rgb` | no | sRGB | 8-bit |
| `hexAlpha` | yes | sRGB | 8-bit |
| `rgba` | yes | sRGB | 8-bit |
| `hsl` | yes | sRGB | ~2dp |
| `hwb` | yes | sRGB | ~2dp |
| `display-p3` | yes | P3 | float 5dp |
| `lab` | yes | unbounded | float 3dp |
| `lch` | yes | unbounded | float 3dp |
| `oklab` | yes | unbounded | float 4dp |
| `oklch` | yes | unbounded | float 4dp |

The capability rungs are **alpha** (carries an alpha channel) and **gamut**
(`sRGB` ⊂ `P3` ⊂ `unbounded`). Precision is a third axis, but 8-bit sRGB is treated
as "faithful enough" for the simplest tier (compatibility wins over sub-perceptual
precision; see the default rationale).

## Fidelity escalation (the color book's single output)

The color book's `output` is an **ordered priority list** of formats. On render it
emits the **first format in the list that faithfully holds the color**:

- the format's **gamut contains** the color, and
- the format **carries alpha** if the color is non-opaque.

It walks down the list until one fits. This stays in the simplest representation a
color allows and escalates only when the color demands more (alpha, then a wider
gamut). It is a single output string; nothing here knows about browsers.

### The default

```
[hex, rgb, hexAlpha, rgba, hsl, hwb, display-p3, lab, lch, oklab, oklch]
```

Ordered simplest → most capable, by rung:

- **sRGB, no alpha**: `hex` (most compact, universal), then `rgb`.
- **sRGB, alpha**: `hexAlpha`, `rgba`, then the higher-precision `hsl` / `hwb`.
- **P3 gamut**: `display-p3`.
- **unbounded**: `lab`, `lch`, `oklab`, `oklch` (lossless from the OKLCH store).

So out of the box: an opaque in-gamut color emits `hex`; add alpha and it becomes
`hexAlpha`; push it outside sRGB and it becomes `display-p3`; beyond P3 it lands in
an unbounded space. Formats that share a rung with an earlier entry (e.g. `rgb`
behind `hex`) are reached only if the list is reordered, they are the configurable
preference order, not dead weight.

## Configured via the factory

The list is `ColorConfig.output`, set per bound book:

```ts
const color = publishBookColor({
  config: { output: [colorFormats.oklch, colorFormats.rgb] },
});
```

A single format is just a one-item list. Custom or experimental formats are authored
with `defineColorSpace` and dropped into the list alongside the built-ins.

## Fully-transparent rendering (`transparent: 'white' | 'black'`)

A colour at alpha 0 has no visible hue, so by default `.css()` emits the `transparent`
keyword (`transparent: 'keyword'`). The config also offers `transparent: 'white'` and
`transparent: 'black'`, which emit the substitute colour at alpha 0 (under the `rgba`
slot, `rgba(255, 255, 255, 0)` or `rgba(0, 0, 0, 0)`).

These options exist partly to sidestep an old-Safari gradient quirk. Inside a gradient,
older Safari interpreted the bare `transparent` keyword as `rgba(0, 0, 0, 0)`, so a fade
to `transparent` produced a fade to black rather than a clean fade-out. Choosing
`white` or `black` explicitly (matching the adjacent stop colour) avoids the unwanted
dark tint. Pick the substitute that matches the colour the gradient fades toward.

## Not the browser fallback

This fidelity escalation produces ONE faithful output. It is distinct from the
**browser-support fallback** (a book-level concern that emits multiple declarations /
`@supports` so an old browser degrades, e.g. `oklch` → `rgb`). Both read these
descriptors, the color book uses the fidelity bits here; the fallback helper uses the
browser bits (`supportsProbe`, `gamutDependent`, `srgbFloor`). See
`../../color-fallback-research.md`.
