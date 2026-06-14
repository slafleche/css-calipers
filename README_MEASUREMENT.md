# Measurements Core

This is the core measurements module for CSS-Calipers. Everything else in the
library builds on these unit-safe measurement types and helpers.

At a glance:

- Create measurements with `m` from a number and a unit; if you omit the unit, it defaults to `px` and is typed as the px measurement type.
- Do unit-safe math with methods like `add` and `multiply`, then call `.css()`
  at the edge to get a CSS string (for example "10px").

## Quick start

```ts
import { m } from "css-calipers";

// Declare vars
const paddingBase = m(4); // defaults to px (and is typed as a px measurement) when no unit is specified
const rotation = m(45, "deg"); // equivalent to a dedicated helper: mDeg(45)

// Do safe arithmetic
const margins = paddingBase.add(4);
const offset = paddingBase.add(margins).multiply(2).subtract(1);

// Emit only at the end in CSS (at runtime or in a build step)
const style = {
  padding: paddingBase.css(),
  transform: `rotate(${rotation.double().css()})`, // 90deg
};
```

If you prefer, you can also import unit helpers from dedicated subpaths. For example, `mPercent` is available from the root entrypoint and from `css-calipers/units/percent`, and all unit helpers are aggregated under `css-calipers/units`.

---

## Features

- **Compile-time unit validation.** Prevents mixing incompatible units.
- **Arithmetic safety.** Operate only within matching units; explicit when
  converting.
- **Explicit emission.** `.css()` outputs a typed string literal only when
  needed.
- **Light runtime footprint.** Near-zero cost when emitted at build time.
- **Framework-agnostic.** Works anywhere TypeScript does.

Any numeric, unit-bearing CSS value is supported: `m` accepts any unit string you’d use in CSS
(`'px'`, `'rem'`, `'%'`, `'vw'`, `'deg'`, `'ms'`, …), and you can model new
measurements without waiting for a dedicated helper. For convenience and better
types, every standard CSS unit also has a named helper (for example
`mPx`, `mPercent`, `mVw`, `mEm`, `mMs`, `mFr`), which are equivalent to calling
`m(value, 'unit')` directly.

CSS-Calipers focuses exclusively on numeric, unit-bearing CSS values. Keywords
like `auto`, `fit-content`, or `max-content`, full shorthand strings,
`var(--token)`, or `calc(...)` expressions should remain explicit strings or
dedicated keyword types in your app or styling layer. Everything else stays as
plain CSS (see "Philosophy & Boundaries" below for more detail). For a concrete
example of this separation in a mixed-input helper, see
[examples/lineHeight-normalizer.example.ts](examples/lineHeight-normalizer.example.ts),
which keeps keywords and CSS variables as plain strings while using measurements
for numeric values.

---

## Should I use this?

CSS-Calipers is a good fit if:

- You already use TypeScript (or plan to) and want compile-time guarantees around CSS units.
- You have a design system or token layer where layout math and unit conversions matter.
- You care about catching unit mismatches and layout invariants early, in dev or tests.

It’s probably overkill if:

- Your project has minimal custom layout math or relies mostly on utility classes/framework CSS.
- You don’t use TypeScript and aren’t looking for stronger typing around CSS values.
- You’re comfortable relying on manual discipline instead of typed measurements for units.

---

### Layout tokens example

```ts
import { m, mPercent, mVw, mVh, assertCondition } from "css-calipers";

// Token-style measurements (px by default)
const spacing = m(8); // Defaults to px and is typed as a PxMeasurement; equivalent to mPx(8)
const cardPadding = spacing.multiply(2); // 16px
const gutter = spacing.multiply(1.5); // 12px

// Responsive bounds expressed in other units
const minWidthPercent = mPercent(75); // 75%; same as m(75, "%")
const maxWidthViewport = mVw(100); // 100vw; same as m(100, "vw")

// Derived content width in px
const contentBase = m(320);
const minCardWidth = m(260);
const maxCardWidth = m(360);

// In real code, these bounds typically come from tokens or configuration,
// so keeping the clamp in measurement space ensures units stay consistent.
const cardWidth = contentBase.clamp(minCardWidth, maxCardWidth);

// Unitless ratio you can reuse elsewhere
const ratio = contentBase.getValue() / spacing.getValue(); // returns a number, no unit

// Apply ratio to a different unit family
const heroHeight = mVh(40).multiply(ratio);

// Invalid arithmetic (different units) fails at compile time
const exampleError = cardWidth.add(heroHeight); // ❌ Type error (px vs vh) see error handling below

// Use plain numbers where they are just counts
const columns = 3;

// In development, enforce simple invariants so layout mistakes fail fast.
// In production, you can either rely on earlier validation or add a separate
// fallback path if this invariant is ever broken.
if (process.env.NODE_ENV !== "production") {
  assertCondition(
    () => columns > 0,
    "cardGridStyles: columns must be greater than zero"
  );
}

// Compose a simple grid layout
const cardGridStyles = {
  display: "grid",
  gap: gutter.css(),
  // Keep fraction units as plain CSS alongside measurement-derived values
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
  // width driven by card width + gutters
  width: cardWidth
    .multiply(columns)
    .add(gutter.multiply(columns - 1))
    .css(),
  // container bounds in percent/viewport units
  minWidth: minWidthPercent.css(),
  maxWidth: maxWidthViewport.css(),
  // derived hero height based on px ratio, expressed in vh and used inside a calc() string
  // calc() stays plain CSS; CSS-Calipers only provides the numeric pieces
  minHeight: `calc(${heroHeight.css()} + 10vh)`,
};
```

---

## Do custom checks your way

CSS-Calipers will happily enforce units anywhere you choose, but it stays
unopinionated about where those guards live. Drop assertions in a component, in
a theme override, hardcode a debug routine, or wire a global invariant; the
structure is up to you:

```ts
import { assertMatchingUnits } from "css-calipers";
import { formTokens } from "@/tokens/forms.tokens";

if (process.env.NODE_ENV !== "production") {
  assertMatchingUnits(
    formTokens.field.paddingBlock,
    formTokens.field.paddingInline,
    "Form control padding mismatch"
  );
}
```

You can apply the same checks globally (e.g., during app bootstrap), only
inside the components that need them, or in dedicated test helpers. For more
complete patterns, see the examples folder: the validation unit-tests example
([examples/validation-unit-tests.example.ts](examples/validation-unit-tests.example.ts)) shows how to
enforce spacing token invariants in a test suite, and the validation and runtime
checks example ([examples/validation-and-runtime-checks.example.ts](examples/validation-and-runtime-checks.example.ts))
shows how to apply dev-only guards around shared tokens in two different
consumers (an HTML snippet and a style object) using the same line-height
measurement.

---

## Error behavior

- Operations are fail-fast: when you call helpers like `add`, `divide`, `clamp`,
  `measurementMin` / `measurementMax`, or the assertion helpers with invalid
  input (for example, mismatched units or non-finite values), CSS-Calipers
  throws a normal `Error`.
- Error messages include the operation name (for example,
  `css-calipers.Measurement.divide` or `css-calipers.assertMatchingUnits`), the
  relevant values/units, and any context string you pass in.
- The library does not catch these errors for you. You choose where to place
  assertions and where (if anywhere) to catch and handle exceptions.
- In production, a common pattern is to wrap assertions in dev-only guards
  (such as `if (process.env.NODE_ENV !== 'production')`) or to enforce
  invariants in tests, so checks stay cheap and predictable at runtime.

For concrete uses of these errors in tests and dev-only guards, see
`TESTING.md` and the validation examples in
[examples/validation-unit-tests.example.ts](examples/validation-unit-tests.example.ts) and
[examples/validation-and-runtime-checks.example.ts](examples/validation-and-runtime-checks.example.ts).

---

## Common errors

### Non-finite measurement value

Example

```
css-calipers.m: Non-finite measurement value: undefined [code=CALIPERS_E_NONFINITE | helper=m | inputs=value=undefined, unit=px | stack=...]
```

What it means
- A measurement was constructed with undefined, NaN, or Infinity.

How to fix
- Provide a real numeric value and a unit (m(12), m(12, "px")).
- Add a context label so the error points to the calling helper or token (m(12, { context: "tokens.cardWidth" })).

### Unit mismatch

Example

```
css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]
```

What it means
- You mixed units without an explicit conversion.

How to fix
- Normalize units at the source (convert em to px or vice versa).
- Add an assertMatchingUnits call where the values enter your system.

### Divide by zero

Example

```
css-calipers.Measurement.divide: Cannot divide 10px by zero [code=CALIPERS_E_DIVIDE_BY_ZERO]
```

What it means
- You attempted to divide by zero in a measurement operation.

How to fix
- Guard inputs before dividing or replace zero with a safe fallback.

### Clamp bounds

Example

```
css-calipers.Measurement.clamp: clamp: min (20px) must be <= max (12px) [code=CALIPERS_E_CLAMP_INVALID_RANGE]
```

What it means
- The clamp minimum is greater than the clamp maximum.

How to fix
- Ensure min and max come from the same source or swap them before calling clamp.

### Stack hints and configuration

For m and unit helpers, errors include a trimmed stack hint in non-production by default.
You can disable or force stack hints globally:

```
import { setErrorConfig } from "css-calipers";

// Disable stack hints everywhere (for production).
setErrorConfig({ stackHints: "off" });

// Force stack hints everywhere (useful in dev or tests).
setErrorConfig({ stackHints: "on" });
```

---

## Factory entrypoint (optional)

If you want instance-scoped configuration and a single re-export surface, use
the factory entrypoint. The instance includes core helpers and unit helpers.

```
import { createCalipers } from "css-calipers/factory";

const calipers = createCalipers({
  errorConfig: { stackHints: "on" },
});

export const { m, mPx, units } = calipers;
```

See [examples/factory-wrapper.example.ts](examples/factory-wrapper.example.ts)
for a wrapper module you can re-export across your project.

---

## Co-existing with other systems

You don’t have to convert everything at once, or at all. If it fits your setup,
you can write small adapters that accept existing CSS strings, CSS-Calipers
measurements, or plain numbers and turn them into CSS values. CSS-Calipers can
be dropped into an existing styling system or used from the ground up; it
focuses narrowly on numeric, unit-bearing values and leaves the rest of your
styling approach up to you. For a more realistic adapter pattern that
normalizes mixed inputs (including CSS variables) into a single css-like value,
see the line-height normalizer example referenced below.

## Advanced

### String Literal Type Exclusion

When helpers must _exclude_ CSS-Calipers–emitted numeric, unit-bearing CSS values from a keyword union,
use the exported `MeasurementString` type together with your existing CSS
property typings (for example, the `Property` types from the `csstype`
package):

```ts
import type { MeasurementString } from "css-calipers";
import type { Property } from "csstype";

type SpacingKeyword = Exclude<
  Extract<Property.Margin, string>,
  MeasurementString
>;
```

This lets helpers stay strict: `IMeasurement` for numeric, unit-bearing CSS values; targeted string
keywords for symbolic CSS values, without reintroducing vague unions like
`MeasurementLike`.

### Integration Patterns

- **Typed helpers:** Accept either `IMeasurement` or a constrained keyword type,
  never a generic string.
- **Pre-emission transforms:** Compose all math in CSS-Calipers, emit once at
  the style boundary.
- **Build-time pipelines:** Run measurement math in Node or a build step
  (scripts, codegen, or bundler plugins) and emit plain CSS or tokens for your
  existing styling system so runtime only sees static values.
- **Unit guards in debug:** Use `assertUnit()` in dev-only blocks to confirm
  consistency between related measurements.
- **CSS variables:** Pass CSS-Calipers `.css()` output into style layers that
  interpolate them, but don’t try to store `var(--token)` inside the library.

---

## Philosophy & Boundaries

- **Measurement math lives here; string composition lives elsewhere.**  
  Use CSS-Calipers for unit-aware calculations, then hand results to
  helpers/adapters that emit CSS literals. Keep `calc()`/`linear-gradient()` logic outside
  the library so measurement objects remain pure.

- **`.css()` at runtime is an edge, not a habit.**  
  You can call `.css()` at runtime, but prefer emitting once to avoid hot-path
  string churn.

- **Numbers are operands, not CSS-Calipers values.**  
  You cannot create a CSS-Calipers value without a unit. Pass plain numbers as
  operands (`add`, `subtract`, `multiply`, `divide`) or combine with another
  `IMeasurement`, but never store bare numbers inside library state. If a value
  lacks both number and unit, CSS-Calipers won’t track it; you own whatever
  logic wraps it.

- **Model keywords explicitly (not “escape hatches”).**  
  If a helper needs symbolic CSS (e.g., `'auto'`, `'fit-content'`), define a
  precise keyword type and purposely exclude the emitted string type from
  CSS-Calipers so numeric, unit-bearing CSS values remain the default path.

- **CSS custom properties coexist; they don’t mix.**  
  Third-party primitives exposing `var(--token)` should keep those values as raw
  CSS strings. CSS-Calipers is intentionally narrow: it works with numeric
  measurements and unit-safe conversions, not tokens or CSS variables. You can
  still use `var(...)` and token strings anywhere in your styling system; they
  just sit outside the library. If you want those values to flow through
  CSS-Calipers, first extract the numeric value and unit in your own code and
  then pass that measurement into the library.

## Using CSS-Calipers in a larger styling system

CSS is inherently flexible: the same property can accept numbers, unit-bearing
strings, keywords, and CSS variables. CSS-Calipers is one focused piece of that
ecosystem. It keeps the numeric, unit-bearing parts typed and predictable, and
lets the rest of your styling system own tokens, variables, and higher-level
APIs.

For a worked example of this pattern, see
[examples/lineHeight-normalizer.example.ts](examples/lineHeight-normalizer.example.ts). It shows a helper that accepts a
`lineHeight` value from a CMS or configuration (numbers, numeric strings with
units, keywords like `"normal"`, or CSS variables such as
`"var(--body-line-height)"`) and normalizes them into a value with a `.css()`
method. CSS-Calipers only participates when there is a concrete measurement
(numbers and units); keywords and CSS variables remain plain CSS strings owned
by your styling layer. That’s the intended scope: CSS will always be a mix of
values, but the library gives you a tight, unit-safe boundary for the numeric
parts inside a broader styling solution.

### Further examples in this repo

The `examples/` folder contains a few non-published usage sketches:

- [examples/lineHeight-normalizer.example.ts](examples/lineHeight-normalizer.example.ts) &mdash;
  mixed input normalization for `lineHeight` (numbers, strings, CSS variables)
  into a single value with a `.css()` method.
- [examples/validation-unit-tests.example.ts](examples/validation-unit-tests.example.ts) &mdash;
  simple unit tests that enforce spacing token invariants (shared units and
  small &le; large).
- [examples/validation-and-runtime-checks.example.ts](examples/validation-and-runtime-checks.example.ts) &mdash;
  dev-only validation around shared tokens in two different consumers (HTML
  string and style object) using the same line-height measurement.
- [examples/factory-wrapper.example.ts](examples/factory-wrapper.example.ts) &mdash;
  instance-scoped factory wrapper that re-exports the helpers.
