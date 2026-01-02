import {
  type UnitCategory,
  type UnitDefinition,
  type UnitDefinitionRecord,
} from "./unitDefinitions";
import { createCoreApi } from "./internal/createCoreApi";
import {
  createErrorConfigStore,
  type ErrorConfig,
  type ErrorCode,
} from "./internal/errors";
import {
  type IRatio,
  isRatio,
  normalizeRatio,
  parseRatio,
  r,
  type RatioParts,
  ratioToFloat,
  reduceRatio,
  simplifyRatio,
} from "./ratio";

type UnitSymbol = UnitDefinitionRecord[keyof UnitDefinitionRecord]["unit"];

export type MeasurementString<Unit extends string = UnitSymbol> =
  `${number}${Unit}`;

type UnitBrand<Unit extends string> = { readonly __unitBrand: Unit };

export interface IMeasurement<Unit extends string = string> {
  css: () => string;
  toString: () => string;
  getUnit: () => Unit;
  getValue: () => number;
  valueOf: () => number;
  [Symbol.toPrimitive]: (hint: string) => string | number;
  isUnit: (unit: string) => boolean;
  assertUnit: (unit: string, context?: string) => void;
  assert: (
    predicate: (measurement: IMeasurement<Unit>) => boolean,
    message: string
  ) => void;
  equals: (other: IMeasurement<string>) => boolean;
  compare: (other: IMeasurement<string>) => number;
  add: (delta: number | IMeasurement<string>) => IMeasurement<Unit>;
  subtract: (delta: number | IMeasurement<string>) => IMeasurement<Unit>;
  multiply: (factor: number) => IMeasurement<Unit>;
  divide: (divisor: number) => IMeasurement<Unit>;
  double: () => IMeasurement<Unit>;
  half: () => IMeasurement<Unit>;
  negation: (shouldNegate?: boolean) => IMeasurement<Unit>;
  absolute: () => IMeasurement<Unit>;
  round: (precision?: number) => IMeasurement<Unit>;
  floor: () => IMeasurement<Unit>;
  ceil: () => IMeasurement<Unit>;
  clamp: (
    min: IMeasurement<string>,
    max: IMeasurement<string>
  ) => IMeasurement<Unit>;
}

export type BrandedMeasurement<Unit extends string> = IMeasurement<Unit> &
  UnitBrand<Unit>;

export type UnitHelper<Unit extends string = string> = ((
  value: number,
  context?: string
) => BrandedMeasurement<Unit>) & {
  unit: Unit;
};

export type MeasurementOf<T extends UnitHelper> = ReturnType<T>;

export type UnitGuard<T extends UnitHelper> = (
  value: unknown
) => value is MeasurementOf<T>;

export type UnitAssertion<T extends UnitHelper> = (
  value: unknown,
  context?: string
) => asserts value is MeasurementOf<T>;

const defaultErrorStore = createErrorConfigStore();
const coreApi = createCoreApi(defaultErrorStore);

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
  getErrorConfig,
  setErrorConfig,
} = coreApi;

export type MeasurementUnitDefinition = UnitDefinition;
export type MeasurementUnitCategory = UnitCategory;
export { type ErrorConfig, type ErrorCode };
export {
  ratioToFloat,
  isRatio,
  normalizeRatio,
  parseRatio,
  r,
  reduceRatio,
  simplifyRatio,
  type IRatio,
  type RatioParts,
};
