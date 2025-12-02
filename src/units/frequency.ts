import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mHz = makeUnitHelperFromDefinition('mHz');
export const mKhz = makeUnitHelperFromDefinition('mKhz');

export type HzMeasurement = MeasurementOf<typeof mHz>;
export type KhzMeasurement = MeasurementOf<typeof mKhz>;

