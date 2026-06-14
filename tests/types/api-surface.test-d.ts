import { expectAssignable } from 'tsd';

import {
  assertCondition,
  assertPercentMeasurement,
  type CqwMeasurement,
  type DegMeasurement,
  type DpiMeasurement,
  type DvwMeasurement,
  type EmMeasurement,
  type ErrorCode,
  type ErrorConfig,
  type FrMeasurement,
  getErrorConfig,
  hasCssMethod,
  type HzMeasurement,
  type IMeasurement,
  type IRatio,
  isMeasurement,
  isPercentMeasurement,
  isRatio,
  type LvwMeasurement,
  m,
  makeUnitAssert,
  makeUnitGuard,
  measurementMax,
  measurementMin,
  type MeasurementOf,
  type MeasurementString,
  type MeasurementUnitCategory,
  type MeasurementUnitDefinition,
  measurementUnitMetadata,
  mPercent,
  mPx,
  normalizeRatio,
  parseRatio,
  r,
  type RatioParts,
  ratioToFloat,
  reduceRatio,
  setErrorConfig,
  simplifyRatio,
  type SMeasurement,
  type SvwMeasurement,
  type TimeMeasurement,
  toFloat,
  type UnitAssertion,
  type UnitGuard,
  type VwMeasurement,
} from '../../dist/esm';
import * as Units from '../../dist/esm/units';
import * as AbsoluteUnits from '../../dist/esm/units/absolute';
import * as AngleUnits from '../../dist/esm/units/angle';
import * as ContainerUnits from '../../dist/esm/units/container';
import * as FontRelativeUnits from '../../dist/esm/units/font-relative';
import * as FrequencyUnits from '../../dist/esm/units/frequency';
import * as GridUnits from '../../dist/esm/units/grid';
import * as PercentUnits from '../../dist/esm/units/percent';
import * as ResolutionUnits from '../../dist/esm/units/resolution';
import * as TimeUnits from '../../dist/esm/units/time';
import * as ViewportUnits from '../../dist/esm/units/viewport';
import * as ViewportDynamicUnits from '../../dist/esm/units/viewport-dynamic';
import * as ViewportLargeUnits from '../../dist/esm/units/viewport-large';
import * as ViewportSmallUnits from '../../dist/esm/units/viewport-small';

// Default unit (no explicit unit argument) is accepted from the public entry
const apiImplicitMeasurement = m(10);
expectAssignable<IMeasurement<string>>(apiImplicitMeasurement);

// Core constructor and helpers are available from the public entry
const apiMeasurementPx = m(10, 'px');
expectAssignable<IMeasurement<'px'>>(apiMeasurementPx);

const apiPxMeasurement = mPx(4);
expectAssignable<IMeasurement<'px'>>(apiPxMeasurement);

const apiPercentMeasurement = mPercent(50);
expectAssignable<IMeasurement<'%'>>(apiPercentMeasurement);

const apiMeasurementPercent = m(10, '%');
expectAssignable<IMeasurement<'%'>>(apiMeasurementPercent);

const errorConfig: ErrorConfig = getErrorConfig();
setErrorConfig(errorConfig);
const errorCode: ErrorCode = 'CALIPERS_E_NONFINITE';
void errorCode;

// Guards and assertions are exported with the expected shapes
declare const unknownValue: unknown;

if (isMeasurement(unknownValue)) {
  expectAssignable<IMeasurement<string>>(unknownValue);
}

if (isPercentMeasurement(unknownValue)) {
  expectAssignable<IMeasurement<'%'>>(unknownValue);
}

declare let maybePercentValue: unknown;

const useApiAssertPercent = () => {
  assertPercentMeasurement(maybePercentValue);
  expectAssignable<IMeasurement<'%'>>(maybePercentValue);
};

// MeasurementString and unit metadata types are exported and coherent
declare const pxCss: MeasurementString<'px'>;
expectAssignable<string>(pxCss);

const percentMeta = measurementUnitMetadata.mPercent;
expectAssignable<MeasurementUnitDefinition>(percentMeta);

declare const category: MeasurementUnitCategory;
void category;

// Percent and px helpers are available via the units entrypoint
const unitsPx = Units.mPx(4);
expectAssignable<IMeasurement<'px'>>(unitsPx);

const unitsPercent = Units.mPercent(50);
expectAssignable<IMeasurement<'%'>>(unitsPercent);

// Percent helpers are also available via the units/percent subpath
const subpathPercent = PercentUnits.mPercent(75);
expectAssignable<IMeasurement<'%'>>(subpathPercent);

// Spot-check one helper per other unit family from the units entrypoint
const unitsEm = Units.mEm(1);
expectAssignable<IMeasurement<'em'>>(unitsEm);

const unitsVw = Units.mVw(10);
expectAssignable<IMeasurement<'vw'>>(unitsVw);

const unitsSvw = Units.mSvw(10);
expectAssignable<IMeasurement<'svw'>>(unitsSvw);

const unitsLvw = Units.mLvw(10);
expectAssignable<IMeasurement<'lvw'>>(unitsLvw);

const unitsDvw = Units.mDvw(10);
expectAssignable<IMeasurement<'dvw'>>(unitsDvw);

const unitsCqw = Units.mCqw(10);
expectAssignable<IMeasurement<'cqw'>>(unitsCqw);

const unitsDeg = Units.mDeg(90);
expectAssignable<IMeasurement<'deg'>>(unitsDeg);

const unitsS = Units.mS(1);
expectAssignable<IMeasurement<'s'>>(unitsS);

const unitsHz = Units.mHz(60);
expectAssignable<IMeasurement<'hz'>>(unitsHz);

const unitsDpi = Units.mDpi(96);
expectAssignable<IMeasurement<'dpi'>>(unitsDpi);

const unitsFr = Units.mFr(1);
expectAssignable<IMeasurement<'fr'>>(unitsFr);

// Spot-check one helper per unit family via the family subpaths
const absPx = AbsoluteUnits.mPx(2);
expectAssignable<IMeasurement<'px'>>(absPx);

const fontEm = FontRelativeUnits.mEm(2);
expectAssignable<IMeasurement<'em'>>(fontEm);

const vpVw = ViewportUnits.mVw(5);
expectAssignable<IMeasurement<'vw'>>(vpVw);

const vpSmall = ViewportSmallUnits.mSvw(5);
expectAssignable<IMeasurement<'svw'>>(vpSmall);

const vpLarge = ViewportLargeUnits.mLvw(5);
expectAssignable<IMeasurement<'lvw'>>(vpLarge);

const vpDynamic = ViewportDynamicUnits.mDvw(5);
expectAssignable<IMeasurement<'dvw'>>(vpDynamic);

const container = ContainerUnits.mCqw(5);
expectAssignable<IMeasurement<'cqw'>>(container);

const angle = AngleUnits.mDeg(45);
expectAssignable<IMeasurement<'deg'>>(angle);

const time = TimeUnits.mS(2);
expectAssignable<IMeasurement<'s'>>(time);
expectAssignable<TimeMeasurement>(time);

const timeMs = TimeUnits.mMs(250);
expectAssignable<IMeasurement<'ms'>>(timeMs);
expectAssignable<TimeMeasurement>(timeMs);

const frequency = FrequencyUnits.mHz(120);
expectAssignable<IMeasurement<'hz'>>(frequency);

const resolution = ResolutionUnits.mDpi(110);
expectAssignable<IMeasurement<'dpi'>>(resolution);

const grid = GridUnits.mFr(2);
expectAssignable<IMeasurement<'fr'>>(grid);

// Alias types are consistent with their underlying measurement units
expectAssignable<IMeasurement<'em'>>({} as EmMeasurement);
expectAssignable<IMeasurement<'vw'>>({} as VwMeasurement);
expectAssignable<IMeasurement<'svw'>>({} as SvwMeasurement);
expectAssignable<IMeasurement<'lvw'>>({} as LvwMeasurement);
expectAssignable<IMeasurement<'dvw'>>({} as DvwMeasurement);
expectAssignable<IMeasurement<'cqw'>>({} as CqwMeasurement);
expectAssignable<IMeasurement<'deg'>>({} as DegMeasurement);
expectAssignable<IMeasurement<'s'>>({} as SMeasurement);
expectAssignable<IMeasurement<'hz'>>({} as HzMeasurement);
expectAssignable<IMeasurement<'dpi'>>({} as DpiMeasurement);
expectAssignable<IMeasurement<'fr'>>({} as FrMeasurement);

// Generic helpers and types are exported and consistent with concrete helpers

type PercentFromHelper = MeasurementOf<typeof mPercent>;
expectAssignable<IMeasurement<'%'>>({} as PercentFromHelper);

type PercentGuard = UnitGuard<typeof mPercent>;
type PercentAssert = UnitAssertion<typeof mPercent>;

const guardFromFactory = makeUnitGuard(mPercent);
const assertFromFactory = makeUnitAssert(mPercent);

expectAssignable<PercentGuard>(isPercentMeasurement);
expectAssignable<PercentGuard>(guardFromFactory);

expectAssignable<PercentAssert>(assertPercentMeasurement);
expectAssignable<PercentAssert>(assertFromFactory);

// measurementMin and measurementMax preserve unit types
const minPx = measurementMin(m(1, 'px'), m(2, 'px'));
expectAssignable<IMeasurement<'px'>>(minPx);

const maxPercent = measurementMax(mPercent(10), mPercent(20));
expectAssignable<IMeasurement<'%'>>(maxPercent);

expectAssignable<IRatio>(r(16, 9));
expectAssignable<IRatio>(normalizeRatio(r(16, 9)));
expectAssignable<IRatio>(reduceRatio(r(16, 9)));
expectAssignable<IRatio>(simplifyRatio(r(16, 9)));
expectAssignable<RatioParts | null>(parseRatio('16/9'));
expectAssignable<number>(ratioToFloat(r(4, 3)));
expectAssignable<number>(toFloat(r(4, 3)));
expectAssignable<(value: unknown) => value is IRatio>(isRatio);
expectAssignable<IRatio>(r(4, { simplify: true }));

// assertCondition and hasCssMethod are exported with expected shapes
assertCondition(true, 'should accept boolean');
assertCondition(() => true, 'should accept thunk');

declare const maybeHasCss: unknown;
if (hasCssMethod(maybeHasCss)) {
  expectAssignable<() => string>(maybeHasCss.css);
}
