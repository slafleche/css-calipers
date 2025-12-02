import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mCqw = makeUnitHelperFromDefinition('mCqw');
export const mCqh = makeUnitHelperFromDefinition('mCqh');
export const mCqi = makeUnitHelperFromDefinition('mCqi');
export const mCqb = makeUnitHelperFromDefinition('mCqb');
export const mCqmin = makeUnitHelperFromDefinition('mCqmin');
export const mCqmax = makeUnitHelperFromDefinition('mCqmax');

export type CqwMeasurement = MeasurementOf<typeof mCqw>;
export type CqhMeasurement = MeasurementOf<typeof mCqh>;
export type CqiMeasurement = MeasurementOf<typeof mCqi>;
export type CqbMeasurement = MeasurementOf<typeof mCqb>;
export type CqminMeasurement = MeasurementOf<typeof mCqmin>;
export type CqmaxMeasurement = MeasurementOf<typeof mCqmax>;

