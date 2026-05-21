# Media queries

Build typed, unit-safe media query strings with a small, configurable builder. The media
queries module focuses on feature coverage, not syntax variants: you supply a typed config
object and get a normalized query string.

## Quick start

```ts
import { m } from "css-calipers";
import { mediaQueryFactory } from "css-calipers/mediaQueries";

const queries = {
  mobile: { maxWidth: m(639) },
  tablet: { minWidth: m(640), maxWidth: m(1023) },
  desktop: { minWidth: m(1024) },
};

const media = mediaQueryFactory({
  queries,
  config: {
    label: "breakpoints",
  },
});

const styles = {
  display: "grid",
  gap: "16px",
  ...media({
    mobile: { gridTemplateColumns: "1fr" },
    tablet: { gridTemplateColumns: "repeat(2, 1fr)" },
    desktop: { gridTemplateColumns: "repeat(4, 1fr)" },
  }),
};
```

### Simple style helper

If you want the smallest surface area, makeMediaQueryStyle keeps the same query config shape
and returns a media style object without factory config.

```ts
import { m } from "css-calipers";
import { makeMediaQueryStyle } from "css-calipers/mediaQueries";

const queries = {
  mobile: { maxWidth: m(639) },
  tablet: { minWidth: m(640), maxWidth: m(1023) },
  desktop: { minWidth: m(1024) },
};

const media = makeMediaQueryStyle(queries);

const styles = {
  display: "grid",
  gap: "16px",
  ...media({
    mobile: { gridTemplateColumns: "1fr" },
    tablet: { gridTemplateColumns: "repeat(2, 1fr)" },
    desktop: { gridTemplateColumns: "repeat(4, 1fr)" },
  }),
};
```

## Status and scope

The media queries module ships as a separate entrypoint so it can be omitted entirely when
unused. It aims to cover the CSS media feature set through typed configuration and a set of
composable emitters.

## Defaults at a glance

- Media type defaults to `screen`.
- Validation defaults to `invalidValueMode: "throw"`.
- Linting defaults to `lintingMode: "throw"`.

## Core concepts

Media queries are built from a single config object that aggregates feature groups. The config
shape favors full CSS media feature coverage and type safety over matching every syntax
variant. For future or experimental features, you can extend the feature set with optional
custom expansions.

- Core group: media type, min width, max width.
- Dimensions group: width, height, aspect ratio, orientation.
- Resolution group: resolution, min resolution, max resolution.
- Interaction group: hover, any-hover, pointer, any-pointer, update.
- Preferences group: color scheme, reduced motion, reduced data, contrast, forced colors.
- Display group: color gamut, dynamic range, inverted colors.
- Environment group: scripting, overflow block, overflow inline.
- Custom group: custom features as raw name/value pairs.

All numeric, unit-bearing values use `IMeasurement` from CSS-Calipers.

## Factory and helpers

The factory builds and guards a set of named queries. It enforces module coverage (unsupported
features trigger the invalidValueMode behavior with a module hint) and lets you customize
validation and linting behavior per factory.

```ts
import { m } from "css-calipers";
import { defineMediaQueryModules, mediaQueryFactory } from "css-calipers/mediaQueries";

const modules = defineMediaQueryModules("core", "interaction");

const media = mediaQueryFactory({
  queries: {
    base: { minWidth: m(720) },
    hoverCapable: { hover: "hover" },
  },
  config: {
    label: "header",
    modules,
    errorHandling: {
      invalidValueMode: "throw",
      lintingMode: "log",
    },
  },
});

const styles = media({
  base: { padding: "12px" },
  hoverCapable: { rowGap: "24px" },
});
```

For advanced usage, build your own query builder by composing emitters. Each builder instance
can have its own config and extension hooks.

```ts
import { m } from "css-calipers";
import { createMediaQueryBuilder, emitDimensionsFeatures } from "css-calipers/mediaQueries";

const buildDimensionsQuery = createMediaQueryBuilder({
  emitBase: emitDimensionsFeatures,
  config: {
    errorHandling: {
      invalidValueMode: "log",
      lintingMode: "allow",
    },
  },
});

const query = buildDimensionsQuery({
  width: m(900),
  orientation: "portrait",
});
```

### Helper utilities

The helpers module exposes low-level building blocks:

- `mediaQueryFactory`: builder for a named query map with module guards.
- `defineMediaQueryModules`: typed helper for module lists.
- `createMediaQueryBuilder`: factory creator for typed query builders.
- `buildMediaQueryFromFeatures`: build a query from a raw feature map.
- `buildMediaQueryString`: default builder that includes all modules.
- `buildMediaQueryStringFromParts`: assemble a query from a media type and feature parts.
- `createMediaQueryFeatureEmitter` and `createMediaQueryFeatureEmitterWithTracking`: feature
  emission helpers (the tracking version detects duplicates).
- `mediaQueryOutputVanillaExtract`: optional convenience helper for wrapping media query style
  blocks in vanilla-extract.

## Feature modules

Each feature group lives in its own module and can be composed as needed. All modules expose an
emitter and a type interface for the config:

### Core

- Fields: `type`, `minWidth`, `maxWidth`
- Emitter: `emitCoreFeatures`

### Dimensions

- Fields: `width`, `height`, `minHeight`, `maxHeight`, `aspectRatio`, `minAspectRatio`,
  `maxAspectRatio`, `orientation`
- Emitter: `emitDimensionsFeatures`

### Resolution

- Fields: `resolutionValue`, `minResolution`, `maxResolution`
- Emitter: `emitResolutionFeatures`

### Interaction

- Fields: `hover`, `anyHover`, `pointer`, `anyPointer`, `update`
- Emitter: `emitInteractionFeatures`

### Preferences

- Fields: `colorScheme`, `reducedMotion`, `reducedData`, `contrast`, `forcedColors`
- Emitter: `emitPreferencesFeatures`

### Display

- Fields: `colorGamut`, `dynamicRange`, `invertedColors`
- Emitter: `emitDisplayFeatures`

### Environment

- Fields: `scripting`, `overflowBlock`, `overflowInline`
- Emitter: `emitEnvironmentFeatures`

### Custom features

- Fields: `customFeatures` (map of feature name to string, number, or measurement)
- Emitter: `emitCustomFeatures`

Custom features require a non-empty name. Values must be a primitive or a measurement; any
other object value throws.

## Validation behavior

Validation runs when a builder emits features. It is not a separate test runner and does not
depend on build tools; it runs each time you build a media query.

Validation uses `invalidValueMode`:

- `allow`: skip invalid values without logging.
- `log`: log a warning and continue.
- `throw`: throw an error.

Defaults: `invalidValueMode` is `throw`. The default validators cover basic guards like min/max
comparisons, positive values, and a few redundancy checks.

## Linting behavior

Linting is about potential redundancy or conflicts, such as duplicate feature emissions. It is
controlled by `lintingMode`:

- `allow`: ignore lint warnings.
- `log`: log a warning and continue.
- `throw`: throw an error.

Defaults: `lintingMode` is `throw`. Duplicate feature emissions are detected by the tracking
emitter and handled according to this mode.

## Custom validation and linting hooks

Each module emitter accepts an optional validator function. That validator runs during query
construction, so you can enforce project-specific rules at build time. Linting is handled by
the same builder config and feature emitter tracking, so custom emitters can participate in the
same linting modes. Tests typically call the builder with known-bad inputs and assert that log
or throw behavior matches the config.

## Configuration options

Each factory instance may supply a configuration object:

```ts
import { createMediaQueryBuilder } from "css-calipers/mediaQueries";

const build = createMediaQueryBuilder({
  emitBase: () => {},
  config: {
    errorHandling: {
      invalidValueMode: "throw",
      lintingMode: "log",
    },
  },
});
```

## Examples and recipes

### Global screens + component-specific factory (menu example)

```ts
import { m } from "css-calipers";
import {
  createMediaQueryBuilder,
  emitDimensionsFeatures,
  emitInteractionFeatures,
  emitPreferencesFeatures,
  emitCustomFeatures,
} from "css-calipers/mediaQueries";

const buildScreenQuery = createMediaQueryBuilder({
  emitBase: (props, helpers) => {
    emitDimensionsFeatures(props, helpers);
    emitPreferencesFeatures(props, helpers);
  },
});

const buildMenuQuery = createMediaQueryBuilder({
  emitBase: (props, helpers) => {
    emitInteractionFeatures(props, helpers);
    emitCustomFeatures(props, helpers);
  },
});

const screenQueries = {
  compact: buildScreenQuery({ maxWidth: m(719) }),
  roomy: buildScreenQuery({ minWidth: m(720) }),
  reducedMotion: buildScreenQuery({ reducedMotion: "reduce" }),
};

const menuQueries = {
  hoverCapable: buildMenuQuery({ hover: "hover" }),
  reducedTransparency: buildMenuQuery({
    customFeatures: {
      // Real media feature; support varies across browsers.
      "prefers-reduced-transparency": "reduce",
    },
  }),
};

const menuStyles = {
  "@media": {
    [screenQueries.compact]: { gridTemplateColumns: "1fr" },
    [screenQueries.roomy]: { gridTemplateColumns: "repeat(3, 1fr)" },
    [menuQueries.hoverCapable]: { rowGap: "24px" },
    [menuQueries.reducedTransparency]: { backdropFilter: "none" },
    [screenQueries.reducedMotion]: { transitionDuration: "0ms" },
  },
};
```

### Build a query with custom features

```ts
import { m } from "css-calipers";
import { buildMediaQueryString } from "css-calipers/mediaQueries";

const query = buildMediaQueryString({
  minWidth: m(800),
  customFeatures: {
    "custom-level": 2,
    "min-width": m(900),
  },
});
```

### Use a custom builder with a subset of modules

```ts
import { m } from "css-calipers";
import { createMediaQueryBuilder, emitResolutionFeatures } from "css-calipers/mediaQueries";

const buildResolutionQuery = createMediaQueryBuilder({
  emitBase: emitResolutionFeatures,
});

const query = buildResolutionQuery({
  minResolution: m(192, "dpi"),
});
```

## API reference

Types and core exports:

- `IMediaQueryProps`, `IMediaQueries`, `IMediaQueryStyles`
- `IMediaQueryCore`, `IMediaQueryDimensions`, `IMediaQueryResolutionRange`,
  `IMediaQueryInteraction`, `IMediaQueryPreferences`, `IMediaQueryDisplay`,
  `IMediaQueryEnvironment`, `IMediaQueryCustomFeatures`
- `MediaQueryBuilderConfig`, `MediaQueryBuilderHelpers`
- `MediaQueryFactoryConfig`
- `MediaQueryInvalidValueMode`, `MediaQueryLintingMode`
- `MediaQueryModuleId`, `MediaQueryModulesList`

Functions:

- `buildMediaQueryString`
- `makeMediaQueryStyle`
- `mediaQueryFactory`
- `createMediaQueryBuilder`
- `buildMediaQueryFromFeatures`
- `emitCoreFeatures`, `emitDimensionsFeatures`, `emitResolutionFeatures`, `emitInteractionFeatures`,
  `emitPreferencesFeatures`, `emitDisplayFeatures`, `emitEnvironmentFeatures`, `emitCustomFeatures`
- `defineMediaQueryModules`

## Notes and limitations

- This module focuses on structured features and type safety, not on mirroring every media
  query syntax variant; if you prefer raw query strings, keep them in your styling layer.
- Media type defaults to `screen` when omitted.

## Gotchas and FAQ

- **Why not accept raw query strings?** You can, but the module is optimized for typed,
  structured input. If you already have a raw query string, keep it as-is in your styling
  layer.
- **Why log in tests?** Log mode is meant to surface issues without failing builds. Tests
  typically assert that logs and thrown errors follow config.
- **Can I extend the feature set?** Yes. Use `customFeatures` or custom emitters with your own
  validation rules.
