import type { MeasurementOf } from '../core';
import {
  makeUnitAssert,
  makeUnitGuard,
  makeUnitHelperFromDefinition,
} from '../default';

export const mPercent = makeUnitHelperFromDefinition('mPercent');

export type PercentMeasurement = MeasurementOf<typeof mPercent>;

export const isPercentMeasurement = makeUnitGuard(mPercent);
export const assertPercentMeasurement = makeUnitAssert(mPercent);
