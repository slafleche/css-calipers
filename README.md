# CSS-Calipers

**CSS is code. Measure it like one.**  
Compile-time unit safety for CSS values — no surprises at runtime.

CSS-Calipers provides a type-safe measurement layer for CSS logic.  
Define, validate, and compose unit-aware values (`px`, `%`, `deg`, `ms`, …) at
build time to eliminate silent math errors and improve maintainability in
design-system code.

---

## Install

```bash
npm install css-calipers
```

> 🚧 Work in progress.  
> API surface and docs may change before the first stable release.

---

## Quick Example

```ts
import { m } from 'css-calipers';

// Create a measurement
const padding = m(8, 'px'); // or shorthand m(8) defaults to px
const rotation = m(45, 'deg').double(); // 90deg

// Do safe arithmetic
const paddingBase = m(4);
const margins = paddingBase.add(4);
const offset = paddingBase.add(margins).multiply(2).substract(1);

// Emit only at the end in CSS
const style = {
  padding: paddingBase.css(),
  transform: `rotate(${rotation.css()})`,
};
```

---

## Features

- **Compile-time unit validation.** Prevents mixing incompatible units.
- **Arithmetic safety.** Operate only within matching units; explicit when
  converting.
- **Explicit emission.** `.css()` outputs a typed string literal only when
  needed.
- **Light runtime footprint.** Near-zero cost when emitted at build time.
- **Framework-agnostic.** Works anywhere TypeScript does.

---

## Philosophy & Boundaries

- **Measurement math lives here; string composition lives elsewhere.**  
  Use CSS-Calipers for unit-aware calculations, then hand results to
  helpers/adapters that emit CSS literals. Keep `calc()`/`clamp()` logic outside
  the library so measurement objects remain pure.

- **`.css()` at runtime is an edge, not a habit.**  
  You can call `.css()` at runtime, but prefer emitting once to avoid hot-path
  string churn.

- **Numbers are operands, not CSS-Calipers values.**  
  You cannot create a CSS-Calipers value without a unit. Pass plain numbers as
  operands (`add`, `subtract`, `multiply`, `divide`) or combine with another
  `IMeasurement`, but never store bare numbers inside library state. If a value
  lacks both number and unit, CSS-Calipers won’t track it—you own whatever logic
  wraps it.

- **Model keywords explicitly (not “escape hatches”).**  
  If a helper needs symbolic CSS (e.g., `'auto'`, `'fit-content'`), define a
  precise keyword type and purposely exclude the emitted string type from
  CSS-Calipers so scalars remain the default path.

- **CSS custom properties coexist; they don’t mix.**  
  Third-party primitives exposing `var(--token)` should keep those values as raw
  CSS strings. Feed CSS-Calipers scalars into them where possible, but don’t
  wrap CSS variables inside the library — treat them as parallel pipes that meet
  in the style layer.

---

## Basic Usage

```ts
import { m } from 'css-calipers';

// Measurements carry their unit type
const width = m(200, 'px');
const half = width.half(); // 100px
const padded = width.add(16); // 216px

// Invalid arithmetic (different units) fails at compile time
// width.add(m(5, 'deg')); // ❌ Type error

// Emit for CSS
const box = { width: width.css(), padding: padded.css() };
```

---

## Do custom checks your way

CSS-Calipers will happily enforce units anywhere you choose, but it stays
unopinionated about where those guards live. Drop assertions in a component,
hardcode a debug routine, or wire a global invariant—the structure is up to
you:

```ts
import { assertMatchingUnits } from 'css-calipers';
import { formTokens } from '@/tokens/forms.tokens';

if (process.env.NODE_ENV !== 'production') {
  assertMatchingUnits(
    formTokens.field.paddingBlock,
    formTokens.field.paddingInline,
    'Form control padding mismatch',
  );
}
```

You can apply the same checks globally (e.g., during app bootstrap) or only
inside the components that need them. CSS-Calipers gives you the tools;
placement is a design decision.

---

## Advanced

### String Literal Type Exclusion

When helpers must _exclude_ CSS-Calipers–emitted scalars from a keyword union,
use the exported `MeasurementString` type:

```ts
import type { MeasurementString } from 'css-calipers';

type SpacingKeyword = Exclude<
  Extract<CSS_TYPES.Property.Margin, string>,
  MeasurementString
>;
```

This lets helpers stay strict — `IMeasurement` for scalars; targeted string
keywords for symbolic CSS values — without reintroducing vague unions like
`MeasurementLike`.

### Integration Patterns

- **Typed helpers:** Accept either `IMeasurement` or a constrained keyword type,
  never a generic string.
- **Pre-emission transforms:** Compose all math in CSS-Calipers, emit once at
  the style boundary.
- **Unit guards in debug:** Use `assertUnit()` in dev-only blocks to confirm
  consistency between related measurements.
- **CSS variables:** Pass CSS-Calipers scalars into style layers that
  interpolate them, but don’t try to store `var(--token)` inside the library.
