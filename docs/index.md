# CSS-Calipers

**CSS is code. Treat it that way.**  
Compile-time unit safety for numeric, unit-bearing CSS values, no surprises at runtime.

CSS-Calipers is a tiny layer for typed CSS measurements. Stop parsing CSS strings and
concatenating units. Do your math on real numbers, get compile-time unit safety, and output
CSS only at the edges.

## Install

```bash
npm install css-calipers
```

## Quick start

```ts
import { m } from "css-calipers";

const paddingBase = m(4); // defaults to px when no unit is specified
const rotation = m(45, "deg"); // equivalent to a dedicated helper: mDeg(45)

const style = {
  padding: paddingBase.css(),
  transform: `rotate(${rotation.double().css()})`, // 90deg
};
```

## Next

- Measurements: [/measurements/](/measurements/)
- Media queries: [/media-queries/](/media-queries/)
- Getting started: [/getting-started](/getting-started)
