import {
  makeUnitAssert,
  makeUnitGuard,
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mPercent = makeUnitHelperFromDefinition('mPercent');

export type PercentMeasurement = MeasurementOf<typeof mPercent>;

export const isPercentMeasurement = makeUnitGuard(mPercent);
export const assertPercentMeasurement = makeUnitAssert(mPercent);
