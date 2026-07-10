# The number space: typed scalar CSS inputs

Where plain numbers fit in css-calipers, and which ones are worth typing. This is a
scope decision plus background research, a sibling to the measurement (`m()`) and
ratio (`r()`) families. css-calipers is Layer 1: the toolkit for typed CSS *inputs*.
Measurements cover unit-bearing values; ratio covers aspect-ratio. This file covers
the remaining piece: plain scalar numbers.

## The gap csstype leaves

csstype types property *names* and their keyword values well, but for open numeric
values it falls back to the `(number & {})` escape, which accepts any number.
Verified in `csstype/index.d.ts`:

```ts
type Opacity  = Globals | (string & {}) | (number & {});
type ZIndex   = Globals | "auto" | (number & {}) | (string & {});
type FlexGrow = Globals | (number & {}) | (string & {});
```

So csstype gives you `number`, not a constrained number. `opacity: 1.5`,
`zIndex: 2.7`, and `flexGrow: -1` all type-check clean. There is no range safety and
no integer safety. That is the hole these primitives fill: the property layer is
csstype's job, the *value* layer is ours.

## The number space we are typing

Two primitive kinds cover the constrained-scalar space:

- **integer** (`i()`): a whole number. CSS values that must be integers include
  `z-index`, `order`, `column-count`, `tab-size`, grid line/span counts, `orphans`,
  and `widows`.
- **float** (`f()`): a finite real number. CSS values that are unitless reals include
  `opacity` and the alpha channel (`0..1`), `line-height` as a bare multiplier,
  `flex-grow` / `flex-shrink` (`>= 0`), `animation-iteration-count` (`>= 0`), and
  `font-size-adjust`.

Both accept optional range constraints, so the meaningful CSS shapes fall out of the
two primitives plus a range:

| CSS value                   | Primitive + constraint        |
| --------------------------- | ----------------------------- |
| opacity / alpha             | `f` in `[0, 1]`               |
| line-height (unitless)      | `f`, `>= 0`                   |
| flex-grow / flex-shrink     | `f`, `>= 0`                   |
| animation-iteration-count   | `f`, `>= 0` (or `infinite`)   |
| font-weight                 | `i` (or `f`) in `[1, 1000]`   |
| z-index / order             | `i`                           |
| column-count / tab-size     | `i`, `>= 1` / `>= 0`          |

`aspect-ratio` is already covered by the ratio primitive (`r()`), which now composes
from these scalars (a ratio of two hardened integers is itself hardened).

## The design

- **Raw factories:** `i(value, { min?, max?, context? })` and
  `f(value, { min?, max?, context? })`. The constructor validates finiteness (and
  integer-ness for `i`) and the optional range. Operations re-validate against the
  same constraints, so a hardened value stays hardened (or throws) through arithmetic.
- **Hardened factories:** `hardenInteger({ min?, max? })` and
  `hardenFloat({ min?, max? })` return a bound factory, the scalar analogue of
  `makeUnitHelper` for measurements. This is where a real CSS value is defined once
  and reused, e.g. a `0..1` float factory.
- **Composition:** `r()` accepts `number | IInteger | IFloat` and respects a passed
  primitive's already-validated value.

## The ratio helper family

`r()` builds a ratio (`IRatio`); a small helper family normalizes, reduces, and
re-parts one. All live in `src/ratio.ts`.

- `withNumerator(numerator)` / `withDenominator(denominator)` are `IRatio` methods that
  return a NEW ratio with one part replaced (the other carried over). Each accepts a
  `RatioValue` (`number | IInteger | IFloat`).
- `normalizeRatio(ratio): IRatio` reduces an integer ratio to lowest terms (by GCD) and
  moves a negative sign onto the numerator (so the denominator is positive). A ratio
  with a non-integer part is returned unreduced (only the type is preserved). Throws on
  non-finite parts or a zero denominator.
- `reduceRatio(ratio): IRatio` is an alias of `normalizeRatio`.
- `simplifyRatio(ratio): IRatio` normalizes, then returns a ratio that omits the
  denominator in `css()` when it is `1` (for example `4/1` renders as `4`). `r(...,
  { simplify: true })` runs this for you at construction.
- `parseRatio(value): RatioParts | null` reads a `number | string | IRatio | IInteger |
  IFloat` into `{ numerator, denominator }`. A string may be `"16/9"` or `"16:9"`
  (`/` or `:` delimiter), or a bare number (denominator `1`). Returns `null` on an
  unparseable value, a non-finite part, or a zero denominator.

## Measurement units are lower-cased

`m(value, 'PX')` lower-cases the unit to `px`: the measurement core normalizes the unit
to lowercase on creation (`unit.toLowerCase()` in `src/internal/createCoreApi.ts`), and
the return type is `InscribedMeasurement<Lowercase<Unit>>`, so `'PX'` is `'px'` at
runtime AND in the type. Unit comparisons (`isUnit`, `assertUnit`) lower-case their
argument too, so `m(16, 'PX').isUnit('Px')` is `true`. `makeUnitHelper` applies the
same lowering to its bound unit.

## Out of scope here (deferred, tracked)

- **csstype-typed CSS-value helpers** (`opacity`, `line-height`, `z-index`,
  `font-weight`, ...). These are the semantic layer: a named helper that is a hardened
  scalar under the hood (e.g. `opacity` = `hardenFloat({ min: 0, max: 1 })`) and ties
  to the matching csstype `Property.*` type. The property layer is csstype; the value
  layer is the primitive. Built on top of this foundation, not part of it.
- **Colour consolidation** into css-calipers (today `@css-bookends/color`).

## Relationship to the measurement refinements

Measurements already harden via refinements (`nonNegative`, `nonPositive`,
`inRange(min, max)`) that brand a value. The scalar primitives intentionally keep
their hardening self-contained (constraints carried on the value, re-checked on
derivation) to avoid coupling the standalone `ratio` / `integer` / `float` modules to
the measurement core. The two vocabularies parallel each other and may share a brand
vocabulary in a later pass.
