import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mSvw = makeUnitHelperFromDefinition('mSvw');
export const mSvh = makeUnitHelperFromDefinition('mSvh');
export const mSvi = makeUnitHelperFromDefinition('mSvi');
export const mSvb = makeUnitHelperFromDefinition('mSvb');
export const mSvmin = makeUnitHelperFromDefinition('mSvmin');
export const mSvmax = makeUnitHelperFromDefinition('mSvmax');

export type SvwMeasurement = MeasurementOf<typeof mSvw>;
export type SvhMeasurement = MeasurementOf<typeof mSvh>;
export type SviMeasurement = MeasurementOf<typeof mSvi>;
export type SvbMeasurement = MeasurementOf<typeof mSvb>;
export type SvminMeasurement = MeasurementOf<typeof mSvmin>;
export type SvmaxMeasurement = MeasurementOf<typeof mSvmax>;

