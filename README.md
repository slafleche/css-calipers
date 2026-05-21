# CSS-Calipers

**CSS is code. Treat it that way.**  
Compile-time unit safety for numeric, unit-bearing CSS values, no surprises at runtime.

CSS-Calipers is a tiny layer for typed CSS measurements. Stop parsing CSS
strings and concatenating units. Do your math on real numbers, get
compile-time unit safety, and output CSS only at the edges.

This README is a general overview. Deeper module guides live in their own files.

Docs site: https://css-calipers.lafleche.dev

Module guides:

- Measurements core: `README_MEASUREMENT.md` (or https://css-calipers.lafleche.dev/measurements/)
- Media queries: `README_MEDIAQUERIES.md` (or https://css-calipers.lafleche.dev/media-queries/)

At a glance:

- Create measurements with `m` from a number and a unit; if you omit the unit, it defaults to `px` and is typed as the px measurement type.
- Do unit-safe math with methods like `add` and `multiply`, then call `.css()`
  at the edge to get a CSS string (for example "10px").

## Install

```bash
yarn add css-calipers
# or
npm install css-calipers
```

### Status & support

> 🚧 Work in progress.  
> API surface and docs may change between `0.x` releases until the first stable version.

- Status: early `0.x` release. Backwards compatibility is not guaranteed until `1.0.0`.
- Questions or bugs: open an issue on GitHub (see the repository link at the top of this page or in `package.json`).
- Tooling: tested primarily with TypeScript 5.6+ on Node 24+.

---

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

## Media queries

```ts
import { m } from "css-calipers";
import { mediaQueryFactory } from "css-calipers/mediaQueries";

const media = mediaQueryFactory({
  queries: {
    mobile: { maxWidth: m(639) },
    desktop: { minWidth: m(640) },
  },
  config: {
    label: "layout",
  },
});

const styles = {
  ...media({
    mobile: { gridTemplateColumns: "1fr" },
    desktop: { gridTemplateColumns: "repeat(4, 1fr)" },
  }),
};
```

See README_MEDIAQUERIES.md for the full media queries guide.

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

## Learn more

- Measurements guide: `README_MEASUREMENT.md` (or https://css-calipers.lafleche.dev/measurements/)
- Media queries guide: `README_MEDIAQUERIES.md` (or https://css-calipers.lafleche.dev/media-queries/)
