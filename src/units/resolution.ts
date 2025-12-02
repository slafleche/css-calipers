import {
  makeUnitHelperFromDefinition,
  type MeasurementOf,
} from '../core';

export const mDpi = makeUnitHelperFromDefinition('mDpi');
export const mDpcm = makeUnitHelperFromDefinition('mDpcm');
export const mDppx = makeUnitHelperFromDefinition('mDppx');

export type DpiMeasurement = MeasurementOf<typeof mDpi>;
export type DpcmMeasurement = MeasurementOf<typeof mDpcm>;
export type DppxMeasurement = MeasurementOf<typeof mDppx>;

