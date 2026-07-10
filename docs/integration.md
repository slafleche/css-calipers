# Integration, patterns, and philosophy

Deeper usage: a worked layout example, where to put checks, advanced typing, co-existing
with other styling systems, and the library's boundaries. For the overview, see the
[README](../README.md).

## Worked example: layout tokens

```ts
import { m, mPercent, mVw, mVh, assertCondition } from "@css-bookends/css-calipers";

// Token-style measurements (px by default)
const spacing = m(8); // Defaults to px and is typed as a PxMeasurement
const cardPadding = spacing.multiply(2); // 16px
const gutter = spacing.multiply(1.5); // 12px

// Responsive bounds expressed in other units
const minWidthPercent = mPercent(75); // 75%; same as m(75, "%")
const maxWidthViewport = mVw(100); // 100vw; same as m(100, "vw")

// Derived content width in px
const contentBase = m(320);
const minCardWidth = m(260);
const maxCardWidth = m(360);

// Keeping the clamp in measurement space ensures units stay consistent.
const cardWidth = contentBase.clamp(minCardWidth, maxCardWidth);

// Unitless ratio you can reuse elsewhere
const ratio = contentBase.getValue() / spacing.getValue(); // returns a number, no unit

// Apply ratio to a different unit family
const heroHeight = mVh(40).multiply(ratio);

// Invalid arithmetic (different units) fails at compile time
const exampleError = cardWidth.add(heroHeight); // ❌ Type error (px vs vh)

// Use plain numbers where they are just counts
const columns = 3;

// In development, enforce simple invariants so layout mistakes fail fast.
if (process.env.NODE_ENV !== "production") {
  assertCondition(
    () => columns > 0,
    "cardGridStyles: columns must be greater than zero",
  );
}

// Compose a simple grid layout
const cardGridStyles = {
  display: "grid",
  gap: gutter.css(),
  gridTemplateColumns: `repeat(${columns}, 1fr)`, // fraction units stay plain CSS
  width: cardWidth
    .multiply(columns)
    .add(gutter.multiply(columns - 1))
    .css(),
  minWidth: minWidthPercent.css(),
  maxWidth: maxWidthViewport.css(),
  // calc() stays plain CSS; CSS-Calipers only provides the numeric pieces
  minHeight: `calc(${heroHeight.css()} + 10vh)`,
};
```

## Do custom checks your way

CSS-Calipers will enforce units anywhere you choose, but stays unopinionated about where
those guards live. Drop assertions in a component, a theme override, a debug routine, or a
global invariant:

```ts
import { assertMatchingUnits } from "@css-bookends/css-calipers";
import { formTokens } from "@/tokens/forms.tokens";

if (process.env.NODE_ENV !== "production") {
  assertMatchingUnits(
    formTokens.field.paddingBlock,
    formTokens.field.paddingInline,
    "Form control padding mismatch",
  );
}
```

Apply the same checks globally (during app bootstrap), only inside the components that need
them, or in dedicated test helpers. See
[validation-unit-tests](../examples/validation-unit-tests.example.ts) for enforcing spacing
token invariants in a test suite, and
[validation-and-runtime-checks](../examples/validation-and-runtime-checks.example.ts) for
dev-only guards around shared tokens in two different consumers.

For typed value constraints (non-negative, ranges) that also harden the TypeScript type,
see [Value hardening](./hardening.md).

## Advanced typing

### String literal type exclusion

When helpers must _exclude_ CSS-Calipers-emitted measurement strings from a keyword union,
use the exported `MeasurementString` type together with your CSS property typings (for
example, the `Property` types from `csstype`):

```ts
import type { MeasurementString } from "@css-bookends/css-calipers";
import type { Property } from "csstype";

type SpacingKeyword = Exclude<
  Extract<Property.Margin, string>,
  MeasurementString
>;
```

This lets helpers stay strict: `IMeasurement` for numeric, unit-bearing values; targeted
string keywords for symbolic values, without reintroducing vague unions.

### Integration patterns

- **Typed helpers:** accept either `IMeasurement` or a constrained keyword type, never a
  generic string.
- **Pre-emission transforms:** compose all math in CSS-Calipers, emit once at the style
  boundary.
- **Build-time pipelines:** run measurement math in Node or a build step and emit plain CSS
  or tokens so runtime only sees static values.
- **Unit guards in debug:** use `assertUnit()` in dev-only blocks to confirm consistency
  between related measurements.
- **CSS variables:** pass `.css()` output into style layers that interpolate them, but do
  not store `var(--token)` inside the library.

## Co-existing with other systems

You don't have to convert everything at once, or at all. Write small adapters that accept
existing CSS strings, CSS-Calipers measurements, or plain numbers and turn them into CSS
values. CSS-Calipers types the numeric inputs to CSS, measurements, ratios, integers, floats,
colour, and per-property value helpers, and leaves the rest of your styling approach up to you.

For a worked adapter that normalizes mixed inputs (numbers, numeric strings with units,
keywords like `"normal"`, CSS variables like `"var(--body-line-height)"`) into a single
value with a `.css()` method, see
[lineHeight-normalizer](../examples/lineHeight-normalizer.example.ts). CSS-Calipers only
participates when there is a concrete measurement; keywords and CSS variables remain plain
CSS strings owned by your styling layer.

## Philosophy and boundaries

- **Measurement math lives here; string composition lives elsewhere.** Use CSS-Calipers for
  unit-aware calculations, then hand results to helpers/adapters that emit CSS literals.
  Keep `calc()` / `linear-gradient()` logic outside the library so measurement objects stay
  pure.
- **`.css()` at runtime is an edge, not a habit.** You can call `.css()` at runtime, but
  prefer emitting once to avoid hot-path string churn.
- **Typed values vs operands.** Numbers that ARE CSS values (opacity, z-index, ratios) are
  typed via `i()` / `f()` / `r()` and the per-property helpers; a number used only as an
  arithmetic operand (a multiplier) needs no wrapper. A measurement still requires a unit:
  `m()` covers the unit-bearing values, the scalar primitives cover the unitless ones.
- **Model keywords explicitly (not "escape hatches").** If a helper needs symbolic CSS
  (`'auto'`, `'fit-content'`), define a precise keyword type and exclude the emitted string
  type so numeric values remain the default path.
- **CSS custom properties coexist; they don't mix.** Keep `var(--token)` values as raw CSS
  strings. To flow such a value through CSS-Calipers, extract the numeric value and unit in
  your own code first, then pass that measurement in.
