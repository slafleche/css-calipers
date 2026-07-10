import type { MeasurementOf } from '../core';
import { makeUnitHelperFromDefinition } from '../default';

export const mFr = makeUnitHelperFromDefinition('mFr');

export type FrMeasurement = MeasurementOf<typeof mFr>;
