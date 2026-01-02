# CSS-Calipers Container Queries

Build typed, unit-safe container query strings with a focused builder. The
container queries module uses typed condition objects (including comparisons)
and returns normalized query strings for @container rules.

## Quick start

```ts
import { m, r } from "css-calipers";
import { makeContainerQueryStyle } from "css-calipers/containerQueries";

const queries = {
  wideCard: {
    inlineSize: { operator: ">=", value: m(28, "rem") },
  },
  squareCard: { aspectRatio: r(1) },
};

const container = makeContainerQueryStyle(queries);

const styles = {
  ".card": {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    ...container({
      wideCard: {
        gridTemplateColumns: "1fr 2fr",
        gridTemplateRows: "none",
        alignItems: "stretch",
      },
      squareCard: { 
        // makesa no sense, change flex direction maybe.
       },
    }),
  },
};
```

### Aspect ratios

Aspect ratio queries require the ratio helper `r()` so ratios stay explicit and
typed. Use `r(1)` for 1/1 or `r(16, 9)` for 16/9.

### Factory and modules

Use the factory to guard module coverage and control validation/linting
behavior. Modules are opt-in; if you omit the modules list, all modules are
enabled.

```ts
import { m } from "css-calipers";
import {
  containerQueryFactory,
  defineContainerQueryModules,
} from "css-calipers/containerQueries";

const modules = defineContainerQueryModules("core", "inline");

const container = containerQueryFactory({
  queries: {
    card: {
      query: {
        condition: {
          minWidth: m(24),
          inlineSize: { operator: ">=", value: m(28, "rem") },
        },
      },
      styles: {}, // why styles here, we're defining a query
    },
  },
  config: {
    label: "card-queries",
    modules,
  },
});
```

### Nesting with media queries

Container and media query style objects can be nested when you need to scope
component queries to device breakpoints.

```ts
import { m } from "css-calipers";
import { makeMediaQueryStyle } from "css-calipers/mediaQueries";
import { makeContainerQueryStyle } from "css-calipers/containerQueries";

const media = makeMediaQueryStyle({
  desktop: { minWidth: m(1024) },
});

const container = makeContainerQueryStyle({
  wideCard: {
    inlineSize: { operator: ">=", value: m(28, "rem") },
  },
});

const styles = media({
  desktop: container({
    wideCard: {
      gridTemplateColumns: "1fr 2fr",
      gridTemplateRows: "none",
    },
  }),
});
```

If you use vanilla-extract, wrap query outputs with
`mediaQueryOutputVanillaExtract` and `containerQueryOutputVanillaExtract` to
match its expected style shape.
