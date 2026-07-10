// CORPUS: the css-calipers FULL-SURFACE entry. It re-exports the entire package
// surface (`export * from './index'`, which itself surfaces the master factory
// from `./bundle`) plus the sub-factories, so a consumer who wants everything in
// one import (`@css-bookends/css-calipers/corpus`) gets it. A bare
// `createCalipersBundle()` binds the whole calipers surface at defaults; it is
// also this module's DEFAULT export (re-exported from `./bundle`).
//
// The master factory itself lives in `./bundle` (cycle-free) so the package ROOT
// can surface it too, exactly like `createColor`. Configuration always goes
// through a factory; this entry is the convenience layer on top.
import { createCalipers } from './factory';

export * from './index';
// `createCalipers` lives on the `./factory` real path and is not re-exported by the root;
// surface it here so the corpus exposes both sub-factories (`createCalipers` / `createColor`).
export { createCalipers };
export { default } from './bundle';
export type {
  CalipersFactoryConfig,
  CalipersInstance,
} from './factory';
