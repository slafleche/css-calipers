import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mLvw = makeUnitHelperFromDefinition('mLvw');
export const mLvh = makeUnitHelperFromDefinition('mLvh');
export const mLvi = makeUnitHelperFromDefinition('mLvi');
export const mLvb = makeUnitHelperFromDefinition('mLvb');
export const mLvmin = makeUnitHelperFromDefinition('mLvmin');
export const mLvmax = makeUnitHelperFromDefinition('mLvmax');

export type LvwMeasurement = MeasurementOf<typeof mLvw>;
export type LvhMeasurement = MeasurementOf<typeof mLvh>;
export type LviMeasurement = MeasurementOf<typeof mLvi>;
export type LvbMeasurement = MeasurementOf<typeof mLvb>;
export type LvminMeasurement = MeasurementOf<typeof mLvmin>;
export type LvmaxMeasurement = MeasurementOf<typeof mLvmax>;
