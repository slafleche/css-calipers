import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mPx = makeUnitHelperFromDefinition('mPx');
export const mCm = makeUnitHelperFromDefinition('mCm');
export const mMm = makeUnitHelperFromDefinition('mMm');
export const mQ = makeUnitHelperFromDefinition('mQ');
export const mIn = makeUnitHelperFromDefinition('mIn');
export const mPc = makeUnitHelperFromDefinition('mPc');
export const mPt = makeUnitHelperFromDefinition('mPt');

export type PxMeasurement = MeasurementOf<typeof mPx>;
export type CmMeasurement = MeasurementOf<typeof mCm>;
export type MmMeasurement = MeasurementOf<typeof mMm>;
export type QMeasurement = MeasurementOf<typeof mQ>;
export type InMeasurement = MeasurementOf<typeof mIn>;
export type PcMeasurement = MeasurementOf<typeof mPc>;
export type PtMeasurement = MeasurementOf<typeof mPt>;
