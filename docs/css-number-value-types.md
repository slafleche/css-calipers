# CSS unitless-number value types and properties

Reference catalogue of every CSS value that is a unitless number, both the value
*types* (data types) and the named *properties* that use them. This feeds the typed
scalar primitives in css-calipers: integer `i()`, float `f()`, and the future
per-property helpers (for example `opacity`). It is the companion data behind
[the number space](./number-space.md).

## Sources

Every range, default, and constraint below was verified against its primary MDN
page (and cross-checked against the CSS specs where the MDN value table is
ambiguous). The pages used:

Value types:

- `<number>`: https://developer.mozilla.org/en-US/docs/Web/CSS/number
- `<integer>`: https://developer.mozilla.org/en-US/docs/Web/CSS/integer
- `<alpha-value>`: https://developer.mozilla.org/en-US/docs/Web/CSS/alpha-value
- `<ratio>`: https://developer.mozilla.org/en-US/docs/Web/CSS/ratio
- `<flex>` (the `fr` unit, excluded): https://developer.mozilla.org/en-US/docs/Web/CSS/flex_value
- `<zero>` (spec only, no MDN page): https://www.w3.org/TR/css-values-4/#zero-value
- CSS Values and Units Level 4: https://www.w3.org/TR/css-values-4/

Properties (one per page, listed in the property table below alongside each row).

## Scope

In scope: CSS values that are unitless numbers. That covers the number data types
(`<number>`, `<integer>`, `<alpha-value>`) and every property that accepts a bare
number with no unit attached.

Out of scope, excluded by design:

- String or keyword values with no number (`display: flex`, colour keywords,
  `position: absolute`). These carry no number.
- Number plus unit values: lengths (`px`, `rem`, `em`), angles (`deg`, `rad`),
  times (`s`, `ms`), frequencies (`hz`), resolutions (`dpi`), and the `fr` flex
  unit. These are already handled by the measurement primitive `m()`.
- Percentages (`%`). Also `m()`'s domain.

Two boundary cases are listed but flagged:

- `<ratio>` (used by `aspect-ratio`) is already covered by the ratio primitive
  `r()`. It appears here for completeness, marked as already covered.
- `<alpha-value>` can be a `<number>` in 0..1 *or* a `<percentage>`. The unitless
  number form is in scope. The percentage alternative is noted per row.

## Value types

### `<number>`

- Definition: a real number. Can be an integer, a number with a fractional
  component, or base-ten scientific notation (`1e3`). May carry one leading `+`
  or `-`. Extends the syntax of `<integer>`.
- Kind: real (float). A plain integer is also a valid `<number>`.
- Range: none defined. The spec sets no minimum or maximum.
- Maps to: `f()`.

### `<integer>`

- Definition: a whole number, positive or negative. One or more decimal digits,
  optional leading `+` or `-`. A special case of `<number>`. No scientific
  notation, no fractional part (`12.0` is a `<number>`, not an `<integer>`).
- Kind: integer.
- Range: none defined. The spec sets no minimum or maximum. (Spec note: when a
  value is rounded to the nearest integer, an exact `.5` rounds toward positive
  infinity.)
- Maps to: `i()`.

### `<alpha-value>`

- Definition: either a `<number>` or a `<percentage>`. Used for opacity and
  alpha channels (`opacity`, `rgb(... / <alpha-value>)`, `shape-image-threshold`).
- Kind (number form): real (float).
- Range: 0 (fully transparent) to 1 (fully opaque) as a number; 0% to 100% as a
  percentage.
- Clamping: out-of-range values are permitted and clamped, not rejected. MDN
  states it verbatim: values outside 0 to 1 are clamped into 0..1. So `1.5`
  becomes `1` and `-0.5` becomes `0`, and the declaration stays valid. This is a
  clamp rule, distinct from the unbounded `<number>` and `<integer>` types.
- Maps to: `f()` in `[0, 1]`. The opacity-family helper.

### `<ratio>` (already covered by `r()`)

- Definition: a `<number>` followed by `/` and a second `<number>` (`16/9`). A
  single `<number>` is also valid (`1.7777778`, equivalent to `<number>/1`).
  Spaces around the slash are optional.
- Kind: real (float). The two numbers are not restricted to integers (`2.39`,
  `1.85`).
- Range: both numbers must be positive. Formal syntax:
  `<number [0,∞]> [ / <number [0,∞]> ]?`. This is a validity constraint, not a
  clamp.
- Status: already handled by the ratio primitive `r()`, which now composes from
  these scalars (a ratio of two hardened integers is itself hardened). Listed
  here for completeness only.

### `<zero>` (spec-level type, no MDN page)

- Definition: the literal number `0`. Only a literal number token matches;
  expressions that evaluate to zero (`calc(0)`) do not. It exists because a zero
  length may omit its unit, so a unitless `0` is accepted where a `<length>` is
  expected. That exception is length-specific (a `<time>` still needs its unit).
- Kind: the single value 0.
- Range: just `0`.
- Status: an edge case of the length grammar, not a primitive css-calipers needs
  to model. Noted for completeness. No MDN page exists; the reference is the CSS
  Values and Units Level 4 spec.

### Excluded type: `<flex>` (the `fr` unit)

`<flex>` is a `<number>` followed by the required `fr` unit. The unit is
mandatory, so it is a dimension, not a unitless number. It belongs to `m()`'s
domain and is excluded here.

## Properties that accept a unitless number

Columns: Property, Number kind, Valid range or constraint, Initial value, Notes.
Every row is verified against the MDN page linked in the Notes column.

### Opacity and alpha family (real, `[0, 1]`, clamped)

These share the `<number> | <percentage>` syntax, are all real, and all clamp
out-of-range values into `[0, 1]`. They are the canonical home of
`f()` in `[0, 1]`.

| Property | Kind | Range or constraint | Initial | Notes |
| --- | --- | --- | --- | --- |
| `opacity` | real | `[0, 1]`, clamped | `1` | Also accepts a `<percentage>`. Out-of-range clamped (`1.5` to `1`). [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/opacity) |
| `fill-opacity` | real | `[0, 1]`, clamped | `1` | SVG. Also accepts a `<percentage>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/fill-opacity) |
| `stroke-opacity` | real | `[0, 1]`, clamped | `1` | SVG. Also accepts a `<percentage>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-opacity) |
| `stop-opacity` | real | `[0, 1]`, clamped | `1` | SVG gradient stop. Also accepts a `<percentage>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/stop-opacity) |
| `flood-opacity` | real | `[0, 1]`, clamped | `1` | SVG filter. Also accepts a `<percentage>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flood-opacity) |
| `shape-image-threshold` | real | `[0, 1]`, clamped | `0` | Note the initial is `0`, not `1`. Also accepts a `<percentage>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/shape-image-threshold) |

### Other real-number properties (each with its own constraint)

| Property | Kind | Range or constraint | Initial | Notes |
| --- | --- | --- | --- | --- |
| `stroke-miterlimit` | real | `>= 1` (invalid below, not clamped) | `4` | SVG. No percentage, no keyword. Out-of-range is rejected, not clamped. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-miterlimit) |
| `line-height` | real | `>= 0` (number form) | `normal` | The unitless number form is a multiplier of the element's own font-size, re-evaluated per element on inheritance. Also accepts `<length>`, `<percentage>`, and `normal`; those forms compute to a fixed length and inherit frozen. See the line-height note below. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) |
| `font-weight` | real | `[1, 1000]` | `normal` (= `400`) | Number form allows fractional weights for variable fonts (`350`, `550.5`), not just multiples of 100. Also accepts keywords `normal` (400), `bold` (700), `lighter`, `bolder`. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight) |
| `font-size-adjust` | real | `>= 0` | `none` | Forms: `none`, a single `<number>` (metric defaults to `ex-height`), `from-font`, or `<font-metric> <number>`. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust) |
| `flex-grow` | real | `>= 0` | `0` | No percentage, no keyword on the longhand. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow) |
| `flex-shrink` | real | `>= 0` | `1` | No percentage, no keyword on the longhand. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink) |
| `animation-iteration-count` | real | `>= 0` | `1` | Fractional values play partial cycles (`0.5`). Also accepts keyword `infinite`. Comma-separated list (one per animation). No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count) |
| `zoom` | real | `>= 0` | `1` | Also accepts a `<percentage>` (`1.0` equals `100%`). Non-standard keywords `normal` and `reset` exist; MDN flags them as not recommended. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/zoom) |
| `scale` (property) | real | 1, 2, or 3 values; negatives allowed | `none` | Per-axis scale factors. Also accepts `<percentage>`, mixable with numbers (`1.7 50%`). Keyword `none`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/scale) |
| `border-image-width` | real | `>= 0` | `1` | The number is a multiplier of `border-width`. Also accepts `<length-percentage>` and `auto`, 1 to 4 values. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width) |
| `border-image-outset` | real | `>= 0` | `0` | The number is a multiplier of `border-width`. Also accepts `<length>`, 1 to 4 values. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-outset) |
| `border-image-slice` | real | `>= 0` | `100%` | Number or percentage, 1 to 4 values, plus an optional `fill` keyword. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-slice) |
| `mask-border-width` | real | `>= 0` | `auto` | Number multiplier of border-width. Also `<length-percentage>` and `auto`, 1 to 4 values. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-width) |
| `mask-border-outset` | real | `>= 0` | `0` | Number multiplier of border-width. Also `<length>`, 1 to 4 values. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-outset) |
| `mask-border-slice` | real | `>= 0` | `0` | Number or percentage, 1 to 4 values, plus an optional `fill` keyword. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-slice) |
| `initial-letter` | real (size) | `>= 1` | `normal` | Size is a `<number>`; an optional second value is an `<integer>` sink depth. Keyword `normal`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/initial-letter) |

### Integer-valued properties

| Property | Kind | Range or constraint | Initial | Notes |
| --- | --- | --- | --- | --- |
| `z-index` | integer | any; negatives allowed | `auto` | Also accepts keyword `auto`. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/z-index) |
| `order` | integer | any; negatives allowed | `0` | No keyword, no percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/order) |
| `column-count` | integer | `>= 1` | `auto` | Also accepts keyword `auto`. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/column-count) |
| `orphans` | integer | `>= 1` | `2` | No keyword, no percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/orphans) |
| `widows` | integer | `>= 1` | `2` | No keyword, no percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/widows) |
| `-webkit-line-clamp` / `line-clamp` | integer | `>= 1` | `none` | Also accepts keyword `none`. The standardized `line-clamp` also allows `<block-ellipsis>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp) |
| `max-lines` | integer | `>= 1` | `none` | Also accepts keyword `none`. Experimental (CSS Overflow 4), the standardized backing of `line-clamp`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/max-lines) |
| `math-depth` | integer | any; negatives allowed | `0` | Bare `<integer>` sets the value. Also keyword `auto-add` and function `add(<integer>)`. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/math-depth) |
| `hyphenate-limit-chars` | integer | `>= 0` | `auto` | One to three `<integer>` values, mixable with `auto` (defaults 5 / 2 / 2). No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphenate-limit-chars) |
| `counter-reset` | integer | any; negatives allowed | `none` | `<custom-ident> <integer>?` pairs. Omitted integer defaults to `0`. Keyword `none`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-reset) |
| `counter-increment` | integer | any; negatives allowed | `none` | `<custom-ident> <integer>?` pairs. Omitted integer defaults to `1`. Keyword `none`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-increment) |
| `counter-set` | integer | any; negatives allowed | `none` | `<custom-ident> <integer>?` pairs. Omitted integer defaults to `0`. Keyword `none`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/counter-set) |
| `grid-row-start` / `grid-row-end` / `grid-column-start` / `grid-column-end` | integer | line number: nonzero, negatives allowed; `span N`: `>= 1` | `auto` | Line number `<integer>` (negative counts from the end edge, `0` excluded). `span <integer>` count must be positive. Also keywords `auto`, `span`, and `<custom-ident>` named lines. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start) |
| `font-feature-settings` | integer | `>= 0` | `normal` | `<feature-tag-value>` pairs: a 4-char tag plus an optional positive `<integer>` (omitted defaults to `1`), or `on` (= 1) / `off` (= 0). Keyword `normal`. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings) |
| `-webkit-box-ordinal-group` | integer | `>= 1` | `1` | Legacy flexbox, deprecated. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-box-ordinal-group) |

### Mixed: number or unit (number form is in scope, unit form is `m()`'s)

These properties accept a unitless number among other forms. The number form is
listed here; the length, percentage, or unit form belongs to `m()`.

| Property | Number-form kind | Number-form constraint | Initial | Notes |
| --- | --- | --- | --- | --- |
| `tab-size` | real | `>= 0` | `8` | MDN's syntax is `<number>`, so a non-integer multiple (`2.5`) is valid. Also accepts a `<length>`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/tab-size) |
| `font-variation-settings` | real | font-defined; negatives allowed | `normal` | `<string> <number>` axis pairs. The CSS spec does not clamp the number; the font's axis definition does. Keyword `normal`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variation-settings) |
| `stroke-width` | real (SVG units) | `>= 0` | `1px` | A unitless number means SVG user units. Also `<length-percentage>` and `<line-width>` keywords. Fundamentally a length property. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-width) |
| `stroke-dashoffset` | real (SVG units) | any | `0` | A unitless number means SVG user units. Also `<length-percentage>`. Fundamentally a length property. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dashoffset) |
| `stroke-dasharray` | real (SVG units) | each entry `>= 0` | `none` | List of entries, each a `<number>` (SVG units), `<length>`, or `<percentage>`, mixable. Keyword `none`. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/stroke-dasharray) |
| `-webkit-box-flex` | real | `>= 0` | `0` | Legacy flexbox, deprecated. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-box-flex) |

### Functions that take unitless numbers (not properties, noted for completeness)

These are value-grammar functions, not properties. They take bare numbers and may
matter when typing the values passed into them.

| Function | Kind | Arity and constraint | Notes |
| --- | --- | --- | --- |
| `scale()` / `scaleX()` / `scaleY()` / `scaleZ()` / `scale3d()` | real | 1, 2, or 3 factors; negatives reflect | `scale()` also accepts a `<percentage>` (`50%` equals `0.5`). The axis functions are pure unitless numbers. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale) |
| `matrix()` / `matrix3d()` | real | exactly 6 / exactly 16 numbers | All arguments are plain unitless numbers, including the `tx` / `ty` coefficients. No percentage. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix) |
| `repeat()` count | integer | `>= 1` | The first argument of a track-list `repeat()` is an `<integer>`. A function argument, not a property value. [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns) |
| `add()` (in `math-depth`) | integer | any | `add(<integer>)` adds to the inherited math depth. |

### A note on `line-height`

`line-height` is the one to watch. The unitless number form (`line-height: 1.5`)
stores a multiplier that each element re-evaluates against its own font-size, so
it inherits as a number. The `<length>`, `<percentage>`, and `em` forms compute to
a fixed length once at the declaration site and inherit that frozen length, which
is usually not what you want. Only the unitless form is a unitless-number value;
the others belong to `m()`. This is why a typed `line-height` helper should accept
the bare number, not collapse it into a length.

## Grouping summary for the primitives

This is the practical mapping from CSS shape to css-calipers primitive.

### Maps to float `f()` in `[0, 1]` (the opacity family)

`opacity`, `fill-opacity`, `stroke-opacity`, `stop-opacity`, `flood-opacity`,
`shape-image-threshold`, plus any `<alpha-value>` number form. All clamp into
`[0, 1]`. A single `hardenFloat({ min: 0, max: 1 })` factory covers the group.

### Maps to float `f()` with `>= 0`

`line-height` (number form), `flex-grow`, `flex-shrink`,
`animation-iteration-count` (plus the `infinite` keyword), `font-size-adjust`,
`zoom`, `tab-size` (number form), `border-image-width`, `border-image-outset`,
`border-image-slice`, `mask-border-width`, `mask-border-outset`,
`mask-border-slice`.

### Maps to float `f()` with a specific range or sign rule

- `font-weight`: `f()` (or `i()`) in `[1, 1000]`.
- `stroke-miterlimit`: `f()` with `>= 1`.
- `scale` and the `scale()` family: `f()`, negatives allowed (reflection).
- `font-variation-settings`: `f()`, font-defined range, negatives allowed.
- `matrix()` / `matrix3d()` coefficients: `f()`, any finite value.

### Maps to integer `i()`, unbounded (negatives allowed)

`z-index`, `order`, `math-depth`, `counter-reset`, `counter-increment`,
`counter-set`, grid line numbers (nonzero), `font-feature-settings` (technically
`>= 0`).

### Maps to integer `i()` with `>= 1`

`column-count`, `orphans`, `widows`, `-webkit-line-clamp` / `line-clamp`,
`max-lines`, grid `span N` counts, `initial-letter` sink depth,
`-webkit-box-ordinal-group`.

### Maps to integer `i()` with `>= 0`

`hyphenate-limit-chars`.

### Already covered, not a new primitive

`aspect-ratio` via `<ratio>` and the ratio primitive `r()`.

## Keyword companions to budget for

Several of these properties pair a number with a keyword. A typed helper should
accept the keyword alongside the bound scalar, not only the number:

- `auto`: `z-index`, `column-count`, grid lines, `mask-border-width`,
  `border-image-width`.
- `none`: `font-size-adjust`, `scale`, `line-clamp`, `max-lines`,
  `counter-*`, `font-variation-settings`, `font-feature-settings`,
  `stroke-dasharray`.
- `normal`: `line-height`, `font-weight`, `font-feature-settings`,
  `font-variation-settings`, `zoom`.
- `infinite`: `animation-iteration-count`.
- `span`: grid line properties.
- `auto-add`: `math-depth`.
