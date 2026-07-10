export * from './core';
// The master factory + its config, surfaced on the ROOT (cycle-free via
// `./bundle`) so classic-resolution consumers (e.g. the compendium) reach it
// without a subpath, exactly like `createColor`. The `/corpus` entry also
// re-exports it (via `export * from './index'`).
export {
  type CalipersBundle,
  type CalipersBundleConfig,
  createCalipersBundle,
} from './bundle';
// The bare default-instance helpers (`m`, refinements, unit-helper builders,
// error-config accessors) come from the single construction path in `./default`,
// which assembles them via `createCalipers()` at its defaults.
export * from './default';
// The native colour input, alongside `m()` / `r()` / `i()` / `f()`. The full value
// surface also lives at the `./color` subpath (for bundler/node16 consumers); the root
// re-exports it too so classic-resolution consumers (e.g. @css-bookends/color) can reach
// it without a subpath. The lower-level value primitives are color-prefixed (and
// `resolve` is re-exported as `resolveColor`) to avoid colliding with calipers' own names.
export {
  type CascadeKeyword,
  color,
  type ColorConfig,
  type ColorFormatPlugin,
  colorFormats,
  type ColorInput,
  type ColorObject,
  type ColorSpace,
  type ColorSpaceDescriptor,
  type Store as ColorStore,
  type ColorString,
  createColor,
  type CreateColorConfig,
  type CssColor,
  type CssFormat,
  type CurrentColor,
  type CustomColor,
  defaultColorConfig,
  defaultFormatPriority,
  defineColorSpace,
  type DeprecatedSystemColor,
  type FormatName,
  type Gamut,
  parseColor,
  resolve as resolveColor,
  type ResolvedColor,
  storeColor,
  type Strictness,
  type SymbolicColor,
  type SystemColor,
  type TransparentRendering,
} from './color';
export * from './units/absolute';
export * from './units/angle';
export * from './units/container';
export * from './units/font-relative';
export * from './units/frequency';
export * from './units/grid';
export * from './units/percent';
export * from './units/resolution';
export * from './units/time';
export * from './units/viewport';
export * from './units/viewport-dynamic';
export * from './units/viewport-large';
export * from './units/viewport-small';
