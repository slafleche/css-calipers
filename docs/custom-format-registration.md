# Custom colour format registration (design)

## Goal

Let a consumer register a colour-format PLUGIN through a factory, extending the colour
pipeline at the input and output edges. Proven by the `zoo` proof-of-concept: arbitrary
animal-name inputs that each map to a predefined colour, with keyword-preferring output
(`flamingo` in, `pink` out). The point is to show the foundation is open to ANY format,
not that zoo is useful.

## Decision: storage stays canonical OKLCH (not pluggable)

Every modification (`darken`, `lighten`, `saturate`, `mix`, `setHue`, ...) operates in
OKLCH; normalizing to OKLCH in `storeColor` is the whole point of the storage step. A
pluggable store would break every modification, so storage is explicitly NOT pluggable.

A plugin instead bridges at the edges, entering and leaving the canonical OKLCH core:

- INPUT: `parse(input) => Color | undefined` returns a culori `Color` (or `undefined` to
  decline). The existing `storeColor` then normalizes it to OKLCH. This is the "convert
  zoo to culori" step: it happens at input, not in storage.
- OUTPUT: `render(color, cfg)` renders from the OKLCH store (the existing
  `ColorSpaceDescriptor.render`).

## Plugin shape

```ts
export interface ColorFormatPlugin<F extends string = string>
  extends ColorSpaceDescriptor<F> {
  /**
   * Recognize and bridge this format's INPUT into culori. Return `undefined` to
   * decline (the next plugin, then the built-in parser, tries).
   */
  parse?: (input: string) => Color | undefined;
}
```

`ColorSpaceDescriptor` already carries `render` plus the fidelity bits (`hasAlpha`,
`gamut`) the escalation reads and the fallback bits (`supportsProbe`, `gamutDependent`,
`srgbFloor`) the future gilding seam reads.

## Factory: createColor({ formats })

```ts
const myColor = createColor({ formats: [zoo] });
```

Returns a `color()`-shaped function bound to a per-instance registry
(`{ ...colorFormats, ...plugins }`) and a plugin-aware input parser. The module-level
`color` is `createColor({ formats: [] })` at defaults (the "default = factory at
defaults" pattern the calipers core already uses).

Wiring:

1. INPUT: the instance parser tries the built-in parse first; on no match it tries each
   plugin's `parse` in order. Built-in precedence keeps existing parsing intact; a plugin
   only claims inputs the built-ins reject (e.g. `flamingo`).
2. OUTPUT + escalation: plugins are valid `output` entries already (the `asDescriptor`
   object branch resolves a passed descriptor without a name lookup).
3. NAMED selectors: the factory is generic over the formats tuple, so the returned
   `ResolvedColor` exposes a typed selector per custom format (e.g. `.zoo`), a lazy getter
   returning a `ResolvedColor` configured to that format (mirrors the built-in format
   selectors and the `whenTransparent` chain). If full generic inference proves to need
   `any`, stop and flag it rather than shipping `any`-laden types.
4. REGISTRY: exposed on the instance so the future gilding/fallback seam can read custom
   descriptors.

## zoo POC (the test)

```ts
const ZOO = { flamingo: 'pink', blackPanther: 'black', whiteFox: 'white' };
const zoo: ColorFormatPlugin<'zoo'> = {
  format: 'zoo',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: false,
  // input: an animal name bridges to its culori colour; anything else declines.
  parse: (input) => (input in ZOO ? parseCulori(ZOO[input]) : undefined),
  // output: quantize the stored colour to the nearest animal, emit its CSS word.
  render: (c) => nearestAnimalCss(c),
};
const myColor = createColor({ formats: [zoo] });
```

Round-trip assertions:

- input bridge: `myColor('flamingo').zoo.css()` === `'pink'` (parse -> OKLCH -> render).
- named selector: `myColor('#000000').zoo.css()` === `'black'`.
- config priority: `myColor('pink', { output: [zoo, oklch] }).css()` === `'pink'`.
- per-instance scoping: the module-level `color('flamingo')` (no zoo registered) does NOT
  accept the animal name, proving registration is scoped to the instance.

## Gilding fallback seam (built)

The instance registry lets a calipers-aware fallback helper read each descriptor's
`supportsProbe` / `gamutDependent` / `srgbFloor` (plus a declared safe fallback) and emit
multi-declaration fallbacks before Lightning CSS, which cannot fallback a token it does
not recognize.

This is now built. A format declares its browser-compat rewrite via the optional
`ColorFormatPlugin.fallback` hook (a `(css: string) => string` transform, see
`src/color/types.ts`). The gilding finisher's `composeCoreFromFormats` (in
`packages/gilding/src/cores/compose.ts`, tested in
`packages/gilding/tests/compose-core-from-formats.test.ts`) reads each registered
format's `fallback` off the `createColor` registry and runs it as a pre-step in front
of its inner Lightning CSS core (the onion: Lightning stays intact). Formats with no
`fallback` contribute no pre-step. Calipers itself never reads `fallback`; it is purely
additive and takes on no gilding dependency.
