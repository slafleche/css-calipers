import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mS = makeUnitHelperFromDefinition('mS');
export const mMs = makeUnitHelperFromDefinition('mMs');

export type SMeasurement = MeasurementOf<typeof mS>;
export type MsMeasurement = MeasurementOf<typeof mMs>;

