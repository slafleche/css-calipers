# css-calipers

Compile-time unit safety for numeric, unit-bearing CSS values via typed measurements.

## Install

```sh
npm i css-calipers
```

## Quick start

```ts
import { m, toCss } from "css-calipers";

const width = m(12);
const cssWidth = toCss(width); // "12px"
```

