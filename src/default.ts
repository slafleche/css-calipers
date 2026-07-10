// THE DEFAULT INSTANCE. This module sits ABOVE both `core.ts` and `factory.ts`
// and is the single place where the package's bare, default-instance helpers are
// assembled. It calls the public factory `createCalipers()` at its defaults, so
// the bare `m` / refinements / unit-helper builders below are exactly the same
// construction path a consumer gets from `createCalipers()` with no config. The
// default can no longer drift from a custom instance, because there is one path.
//
// `factory.ts` depends only on the `internal/*` builders (which import nothing
// but TYPES from `core.ts`), so importing the factory here introduces no runtime
// import cycle: `default.ts -> factory.ts -> internal/* -> core.ts (types only)`.
// `core.ts` itself imports nothing from this module.
import { createCalipers } from './factory';

const defaultCalipers = createCalipers();

export const {
  m,
  isMeasurement,
  assertMatchingUnits,
  measurementMin,
  measurementMax,
  measurementUnitMetadata,
  makeUnitHelper,
  makeUnitHelperFromDefinition,
  makeUnitGuard,
  makeUnitAssert,
  hasCssMethod,
  assertUnit,
  assertCondition,
  makeMeasurementRefinement,
  nonNegative,
  nonPositive,
  inRange,
  getErrorConfig,
  setErrorConfig,
} = defaultCalipers;
