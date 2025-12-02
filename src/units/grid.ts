import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mFr = makeUnitHelperFromDefinition('mFr');

export type FrMeasurement = MeasurementOf<typeof mFr>;

