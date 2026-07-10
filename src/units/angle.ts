import type { MeasurementOf } from '../core';
import { makeUnitHelperFromDefinition } from '../default';

export const mDeg = makeUnitHelperFromDefinition('mDeg');
export const mRad = makeUnitHelperFromDefinition('mRad');
export const mGrad = makeUnitHelperFromDefinition('mGrad');
export const mTurn = makeUnitHelperFromDefinition('mTurn');

export type DegMeasurement = MeasurementOf<typeof mDeg>;
export type RadMeasurement = MeasurementOf<typeof mRad>;
export type GradMeasurement = MeasurementOf<typeof mGrad>;
export type TurnMeasurement = MeasurementOf<typeof mTurn>;
