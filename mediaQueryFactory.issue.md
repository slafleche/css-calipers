Title: mediaQueryFactory emits stray `& {}` when spread into vanilla-extract style objects

Context  
In `portfolio`, we used `mediaQueryFactory` with `mediaQueryOutputVanillaExtract` for component-scoped media queries. When the resulting object is spread into a `style()` object, it can emit a bare `& {}` block in the compiled CSS.

Exact code used (problem case)  
```ts
export const componentSpecificQueries = mediaQueryFactory({
  queries: {
    card_oneColumn: {
      maxWidth: cardLayout.oneColumn.minWidth,
    } as IMediaQueryProps,
  },
  config: {
    label: 'Component Specific Media Queries',
    modules: defineMediaQueryModules('core'),
    output: mediaQueryOutputVanillaExtract,
  },
});
```

Observed behavior  
`mediaQueryOutputVanillaExtract` returns `{ '&': { '@media': { ... } } }`.  
When that is spread into a `style({ ... })` object, vanilla-extract treats `&` as a selector block, producing an empty or unexpected `& {}` wrapper.

Expected behavior  
For component-scoped use inside `style()`, we want a plain `@media` block with no `&` wrapper.

Comparable code that works (same intent, different helper)  
```ts
export const componentSpecificQueries = makeMediaQueryStyle({
  card_oneColumn: {
    maxWidth: cardLayout.oneColumn.minWidth,
  } as IMediaQueryProps,
});
```

Notes  
Both approaches aim to produce the same media query, but `makeMediaQueryStyle` emits a plain `@media` object that spreads cleanly into a `style()` definition, avoiding the stray `& {}` output.
