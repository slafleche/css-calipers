// The calipers MASTER factory + its config, in a CYCLE-FREE module so BOTH the
// package root (`@css-bookends/css-calipers`) and the `/corpus` subpath can
// surface it (root re-exports it like it does `createColor`; corpus gets it via
// `export * from './index'`). It combines the sub-factories (`createCalipers` /
// `createInteger` / `createFloat` / `createColor`) under one keyed config with
// the cascade: own unit key -> bundle `global` -> factory default.
import {
  type ColorFormatPlugin,
  createColor,
  type CreateColorConfig,
  type CustomColor,
} from './color';
import {
  type CalipersFactoryConfig,
  type CalipersInstance,
  createCalipers,
} from './factory';
import {
  createFloat,
  type FloatApi,
  type FloatFactoryConfig,
} from './float';
import { type Hardening } from './hardening';
import {
  createInteger,
  type IntegerApi,
  type IntegerFactoryConfig,
} from './integer';

/** The calipers master config: a `global` slot + one OPTIONAL key per sub-factory. */
export interface CalipersBundleConfig<
  P extends ReadonlyArray<ColorFormatPlugin> = readonly [],
> {
  /**
   * Shared options that cascade to every sub-factory. A unit's own keyed config
   * wins; otherwise it falls back here, then to the built-in factory default.
   */
  global?: {
    /** Hardening reaction for the measurement / scalar surface. */
    hardening?: Hardening;
  };
  /** forwarded to `createCalipers` (the measurement / scalar surface + units). */
  measurements?: CalipersFactoryConfig;
  /** forwarded to `createInteger` (the integer surface). */
  integer?: IntegerFactoryConfig;
  /** forwarded to `createFloat` (the float surface). */
  float?: FloatFactoryConfig;
  /** forwarded to `createColor` (custom colour format plugins). */
  color?: CreateColorConfig<P>;
}

/** The bound calipers bundle: every helper plus the colour instance, in one object. */
export type CalipersBundle<
  P extends ReadonlyArray<ColorFormatPlugin> = readonly [],
> = CalipersInstance &
  IntegerApi &
  FloatApi & { color: CustomColor<P> };

/**
 * The calipers MASTER factory: combine the sub-factories under one keyed config,
 * returning every helper bound in one object. Mirrors `publishCompendium`. A
 * bare `createCalipersBundle()` binds everything at defaults. Each setting
 * resolves own unit key -> bundle `global` -> built-in factory default.
 */
export const createCalipersBundle = <
  const P extends ReadonlyArray<ColorFormatPlugin> = readonly [],
>(
  config: CalipersBundleConfig<P> = {},
): CalipersBundle<P> => ({
  ...createCalipers({
    ...config.measurements,
    // cascade: own (unit key) -> bundle global -> built-in factory default.
    hardening:
      config.measurements?.hardening ?? config.global?.hardening,
  }),
  ...createInteger({
    hardening: config.integer?.hardening ?? config.global?.hardening,
  }),
  ...createFloat({
    hardening: config.float?.hardening ?? config.global?.hardening,
  }),
  // when no colour config is given, P is the default `readonly []` (no custom formats),
  // so an empty formats list is the right default; the double cast satisfies the generic.
  color: createColor(
    config.color ??
      ({ formats: [] } as unknown as CreateColorConfig<P>),
  ),
});

export default createCalipersBundle;
