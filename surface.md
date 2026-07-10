# The typed CSS input surface (css-calipers)

css-calipers types the INPUT VALUE side of CSS. This doc maps which CSS value
types it covers as typed inputs, and how each one complements csstype. Every
entry is source-derived (files cited at the bottom); nothing is inferred.

It deliberately stops at value TYPES. Which CSS PROPERTY gets a dedicated,
pre-constrained helper (so `opacity()` already knows its `[0, 1]` bound) is a
bookends-layer concern, documented separately in the bookends surface
(`packages/css-value-core/surface.md`).

## How this complements csstype

csstype and calipers type two different halves of a CSS declaration, and meet at
the value. They are complementary; calipers ships csstype as a dependency and
never replaces it.

- csstype types the PROPERTY and KEYWORD side: the property names, and for each
  one its keyword companions and overall value shape. It is excellent at that.
- But where a property accepts an OPEN value, csstype has nothing to constrain
  the value with, so it widens that slot to a bare `number` or `string & {}`. A
  `1.5` opacity, a `2.5` z-index, a `px` added to an `em`, an arbitrary colour
  string: all satisfy csstype. You cannot construct a build-time-validated value
  out of that slot.
- calipers fills exactly that gap. Each primitive constructs a validated, branded
  input value (`m(8, 'px')`, `i(2)`, `f(0.5)`, `r(16, 9)`, `color('#3366cc')`),
  and `.css()` renders a string that STILL satisfies csstype on output.

So the rule of thumb: reach for csstype's `Property.X` to name the property and
its keywords; reach for a calipers primitive to construct the open value that
`Property.X` would otherwise leave as a bare `number` / `string`. Together they
form one complete typed surface for CSS input: typed property and keyword side
(csstype), typed value side (calipers).

## Value types covered

Each CSS value type maps to one calipers primitive. The unit families under `m()`
are the actual exported helpers in `src/units/`. The "csstype alone" column is the
shape csstype widens that open value slot to: a value of that shape passes csstype
unchecked, which is the gap calipers closes.

| CSS value type | csstype alone | calipers primitive | concrete units / forms (as exported) |
| --- | --- | --- | --- |
| `<number>` | bare `number` | `f()` | a finite unitless real, optional `min` / `max` bounds |
| `<alpha-value>` (number form) | bare `number` | `f()` in `[0, 1]` | hardened to `[0, 1]` |
| `<integer>` | bare `number` (no integer-ness) | `i()` | a finite whole number, optional `min` / `max` bounds |
| `<ratio>` | `string & {}` | `r()` | `n / d`, each a raw number or a typed `i()` / `f()`; single-number form supported |
| `<length>` (absolute) | `string & {}` | `m()` | `px`, `cm`, `mm`, `Q`, `in`, `pc`, `pt` |
| `<length>` (font-relative) | `string & {}` | `m()` | `em`, `rem`, `ex`, `rex`, `ch`, `rch`, `cap`, `rcap`, `ic`, `ric`, `lh`, `rlh` |
| `<length>` (viewport, default) | `string & {}` | `m()` | `vw`, `vh`, `vi`, `vb`, `vmin`, `vmax` |
| `<length>` (viewport, small) | `string & {}` | `m()` | `svw`, `svh`, `svi`, `svb`, `svmin`, `svmax` |
| `<length>` (viewport, large) | `string & {}` | `m()` | `lvw`, `lvh`, `lvi`, `lvb`, `lvmin`, `lvmax` |
| `<length>` (viewport, dynamic) | `string & {}` | `m()` | `dvw`, `dvh`, `dvi`, `dvb`, `dvmin`, `dvmax` |
| `<length>` (container query) | `string & {}` | `m()` | `cqw`, `cqh`, `cqi`, `cqb`, `cqmin`, `cqmax` |
| `<percentage>` | `string & {}` | `m()` | `%` |
| `<angle>` | `string & {}` | `m()` | `deg`, `rad`, `grad`, `turn` |
| `<time>` | `string & {}` | `m()` | `s`, `ms` |
| `<frequency>` | `string & {}` | `m()` | `Hz`, `kHz` |
| `<resolution>` | `string & {}` | `m()` | `dpi`, `dpcm`, `dppx` |
| `<flex>` | `string & {}` | `m()` | `fr` |
| `<color>` | `string & {}` | `color()` | see the colour section below |

On top of the raw value, `m()` is branded by its unit (so a `px` cannot be added
to an `em`), arithmetic re-validates, and `i()` / `f()` re-validate on every
operation. The refinement layer (`nonNegative`, `inRange(min, max)`, ...) hardens
a checked value's TYPE, so a function can demand "a non-negative measurement" and
the compiler rejects an unchecked one. None of that is expressible in a csstype
property type.

### Colour (`<color>`)

`color()` accepts a CSS string, a structured `ColorObject`, or an existing
resolved colour. Input colour spaces (the `ColorObject` discriminants): `rgb`,
`hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`. Storage normalizes to OKLCH
internally.

Symbolic keyword categories (emit-only, no fixed value, pass through untouched):

- `currentColor`
- system colours (CSS Color 4 current set, e.g. `Canvas`, `CanvasText`,
  `ButtonFace`, `AccentColor`)
- deprecated system colours (Appendix A passthrough, e.g. `ActiveBorder`,
  `Menu`, `Window`)
- CSS-wide cascade keywords: `inherit`, `initial`, `unset`, `revert`,
  `revert-layer`

Output formats (the `.css()` terminal and the named selectors): `rgba`, `rgb`,
`hex`, `hexAlpha`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `displayP3`.
Custom formats are pluggable via `defineColorSpace` / `createColor`. Where csstype
gives `Property.Color` a bare `string & {}`, `color()` parses, validates, and
escalates to the simplest faithful output format.

### Importing only the value types you need

The measurement surface is colour-free. A consumer importing
`@css-bookends/css-calipers/measurements` gets `m()` / `r()` / `i()` / `f()` and
the unit helpers with no `culori` (so no colour) in the dependency graph. Colour
is an opt-in subpath (`@css-bookends/css-calipers/color`).

## Not a calipers value type

calipers types the scalar and dimensioned value types plus colour (the table
above). It does NOT model the composite, non-scalar value types: `<gradient>`,
`<image>`, `<position>`, `<basic-shape>`, `<url>`, `<string>`, `<custom-ident>`,
and the transform / filter function grammars. Those are compositions built in the
books layer or passed through as strings, not calipers primitives. The
spec-level `<zero>` quirk (a unitless `0` where a length is expected) is a
length-grammar edge case, not a primitive.

Property-level coverage and exclusions (which CSS properties get a dedicated
helper, and which catalogued properties are intentionally not exposed) are a
bookends concern: see `packages/css-value-core/surface.md`.

## Sources

- `lexicons/calipers/docs/css-number-value-types.md`
- `lexicons/calipers/src/units/` (index plus `absolute.ts`, `font-relative.ts`,
  `viewport.ts`, `viewport-small.ts`, `viewport-large.ts`,
  `viewport-dynamic.ts`, `container.ts`, `angle.ts`, `time.ts`, `frequency.ts`,
  `resolution.ts`, `grid.ts`, `percent.ts`)
- `lexicons/calipers/src/color/types.ts`
- `lexicons/calipers/src/ratio.ts`, `src/integer.ts`, `src/float.ts`
- `lexicons/calipers/src/measurements.ts`, `src/index.ts` (entry-point names)
- The csstype complement framing matches `lexicons/calipers/README.md`.
