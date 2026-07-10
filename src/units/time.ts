import type { MeasurementOf } from '../core';
import { makeUnitHelperFromDefinition } from '../default';

export const mS = makeUnitHelperFromDefinition('mS');
export const mMs = makeUnitHelperFromDefinition('mMs');

export type SMeasurement = MeasurementOf<typeof mS>;
export type MsMeasurement = MeasurementOf<typeof mMs>;

export type TimeMeasurement = SMeasurement | MsMeasurement;
