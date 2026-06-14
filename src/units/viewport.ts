import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mVw = makeUnitHelperFromDefinition('mVw');
export const mVh = makeUnitHelperFromDefinition('mVh');
export const mVi = makeUnitHelperFromDefinition('mVi');
export const mVb = makeUnitHelperFromDefinition('mVb');
export const mVmin = makeUnitHelperFromDefinition('mVmin');
export const mVmax = makeUnitHelperFromDefinition('mVmax');

export type VwMeasurement = MeasurementOf<typeof mVw>;
export type VhMeasurement = MeasurementOf<typeof mVh>;
export type ViMeasurement = MeasurementOf<typeof mVi>;
export type VbMeasurement = MeasurementOf<typeof mVb>;
export type VminMeasurement = MeasurementOf<typeof mVmin>;
export type VmaxMeasurement = MeasurementOf<typeof mVmax>;
