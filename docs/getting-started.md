# Getting started

This page is the shortest path to a first successful use of CSS-Calipers. For deeper guides:

- Measurements core: [/measurements/](/measurements/)
- Media queries: [/media-queries/](/media-queries/)

## Install

```bash
npm install css-calipers
```

## Status & support

> 🚧 Work in progress.  
> API surface and docs may change between `0.x` releases until the first stable version.

- Status: early `0.x` release. Backwards compatibility is not guaranteed until `1.0.0`.
- Questions or bugs: open an issue on GitHub.
- Tooling: tested primarily with TypeScript 5.6+ on Node 24+.

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

If you prefer, you can also import unit helpers from dedicated subpaths. For example,
`mPercent` is available from the root entrypoint and from `css-calipers/units/percent`, and
all unit helpers are aggregated under `css-calipers/units`.

