import type { MeasurementOf } from '../core';
import { makeUnitHelperFromDefinition } from '../default';

export const mDvw = makeUnitHelperFromDefinition('mDvw');
export const mDvh = makeUnitHelperFromDefinition('mDvh');
export const mDvi = makeUnitHelperFromDefinition('mDvi');
export const mDvb = makeUnitHelperFromDefinition('mDvb');
export const mDvmin = makeUnitHelperFromDefinition('mDvmin');
export const mDvmax = makeUnitHelperFromDefinition('mDvmax');

export type DvwMeasurement = MeasurementOf<typeof mDvw>;
export type DvhMeasurement = MeasurementOf<typeof mDvh>;
export type DviMeasurement = MeasurementOf<typeof mDvi>;
export type DvbMeasurement = MeasurementOf<typeof mDvb>;
export type DvminMeasurement = MeasurementOf<typeof mDvmin>;
export type DvmaxMeasurement = MeasurementOf<typeof mDvmax>;
