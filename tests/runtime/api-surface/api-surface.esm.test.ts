// API-surface contract test for the built ESM bundle.
// This file focuses on export presence and basic shapes, not behavior.
import { describe, expect, it } from 'vitest';

const esmRoot = await import('../../../dist/esm/index.js');
const esmUnits = await import('../../../dist/esm/units/index.js');

const esmUnitsPercent =
  await import('../../../dist/esm/units/percent.js');
const esmUnitsAbsolute =
  await import('../../../dist/esm/units/absolute.js');
const esmUnitsFontRelative =
  await import('../../../dist/esm/units/font-relative.js');
const esmUnitsViewport =
  await import('../../../dist/esm/units/viewport.js');
const esmUnitsViewportSmall =
  await import('../../../dist/esm/units/viewport-small.js');
const esmUnitsViewportLarge =
  await import('../../../dist/esm/units/viewport-large.js');
const esmUnitsViewportDynamic =
  await import('../../../dist/esm/units/viewport-dynamic.js');
const esmUnitsContainer =
  await import('../../../dist/esm/units/container.js');
const esmUnitsAngle =
  await import('../../../dist/esm/units/angle.js');
const esmUnitsTime = await import('../../../dist/esm/units/time.js');
const esmUnitsFrequency =
  await import('../../../dist/esm/units/frequency.js');
const esmUnitsResolution =
  await import('../../../dist/esm/units/resolution.js');
const esmUnitsGrid = await import('../../../dist/esm/units/grid.js');

describe('API surface (ESM)', () => {
  it('exposes expected core exports from the root entrypoint', () => {
    expect(esmRoot).toHaveProperty('m');
    expect(typeof esmRoot.m).toBe('function');

    expect(esmRoot).toHaveProperty('assertUnit');
    expect(typeof esmRoot.assertUnit).toBe('function');
  });

  it('exposes unit helpers via the units aggregator', () => {
    expect(esmUnits).toHaveProperty('mPercent');
    expect(typeof esmUnits.mPercent).toBe('function');

    expect(esmUnits).toHaveProperty('mPx');
    expect(typeof esmUnits.mPx).toBe('function');

    expect(esmUnits).toHaveProperty('mEm');
    expect(typeof esmUnits.mEm).toBe('function');

    expect(esmUnits).toHaveProperty('mVw');
    expect(typeof esmUnits.mVw).toBe('function');

    expect(esmUnits).toHaveProperty('mSvw');
    expect(typeof esmUnits.mSvw).toBe('function');

    expect(esmUnits).toHaveProperty('mLvw');
    expect(typeof esmUnits.mLvw).toBe('function');

    expect(esmUnits).toHaveProperty('mDvw');
    expect(typeof esmUnits.mDvw).toBe('function');

    expect(esmUnits).toHaveProperty('mCqw');
    expect(typeof esmUnits.mCqw).toBe('function');

    expect(esmUnits).toHaveProperty('mDeg');
    expect(typeof esmUnits.mDeg).toBe('function');

    expect(esmUnits).toHaveProperty('mS');
    expect(typeof esmUnits.mS).toBe('function');

    expect(esmUnits).toHaveProperty('mHz');
    expect(typeof esmUnits.mHz).toBe('function');

    expect(esmUnits).toHaveProperty('mDpi');
    expect(typeof esmUnits.mDpi).toBe('function');

    expect(esmUnits).toHaveProperty('mFr');
    expect(typeof esmUnits.mFr).toBe('function');
  });

  it('exposes unit helpers via unit family subpaths', () => {
    expect(esmUnitsPercent).toHaveProperty('mPercent');
    expect(typeof esmUnitsPercent.mPercent).toBe('function');

    expect(esmUnitsAbsolute).toHaveProperty('mPx');
    expect(typeof esmUnitsAbsolute.mPx).toBe('function');

    expect(esmUnitsFontRelative).toHaveProperty('mEm');
    expect(typeof esmUnitsFontRelative.mEm).toBe('function');

    expect(esmUnitsViewport).toHaveProperty('mVw');
    expect(typeof esmUnitsViewport.mVw).toBe('function');

    expect(esmUnitsViewportSmall).toHaveProperty('mSvw');
    expect(typeof esmUnitsViewportSmall.mSvw).toBe('function');

    expect(esmUnitsViewportLarge).toHaveProperty('mLvw');
    expect(typeof esmUnitsViewportLarge.mLvw).toBe('function');

    expect(esmUnitsViewportDynamic).toHaveProperty('mDvw');
    expect(typeof esmUnitsViewportDynamic.mDvw).toBe('function');

    expect(esmUnitsContainer).toHaveProperty('mCqw');
    expect(typeof esmUnitsContainer.mCqw).toBe('function');

    expect(esmUnitsAngle).toHaveProperty('mDeg');
    expect(typeof esmUnitsAngle.mDeg).toBe('function');

    expect(esmUnitsTime).toHaveProperty('mS');
    expect(typeof esmUnitsTime.mS).toBe('function');

    expect(esmUnitsFrequency).toHaveProperty('mHz');
    expect(typeof esmUnitsFrequency.mHz).toBe('function');

    expect(esmUnitsResolution).toHaveProperty('mDpi');
    expect(typeof esmUnitsResolution.mDpi).toBe('function');

    expect(esmUnitsGrid).toHaveProperty('mFr');
    expect(typeof esmUnitsGrid.mFr).toBe('function');
  });

  it('exposes the full root runtime export map', () => {
    const rootKeys = Object.keys(esmRoot).filter(
      (key) => key !== '__esModule',
    );

    const coreRuntimeKeys = [
      'm',
      'r',
      'isMeasurement',
      'isRatio',
      'assertMatchingUnits',
      'measurementMin',
      'measurementMax',
      'measurementUnitMetadata',
      'makeUnitHelper',
      'makeUnitHelperFromDefinition',
      'makeUnitGuard',
      'makeUnitAssert',
      'hasCssMethod',
      'assertUnit',
      'assertCondition',
      'normalizeRatio',
      'parseRatio',
      'ratioToFloat',
      'toFloat',
      'reduceRatio',
      'simplifyRatio',
      'isPercentMeasurement',
      'assertPercentMeasurement',
      'getErrorConfig',
      'setErrorConfig',
    ];

    const unitHelperKeys = Object.keys(
      // measurementUnitMetadata is a runtime record of unit helpers
      // and should align with the exported named helpers.
      // We rely on it here to derive the full set of unit helper names.
      esmRoot.measurementUnitMetadata,
    );

    const expectedKeys = [
      ...coreRuntimeKeys,
      ...unitHelperKeys,
    ].sort();
    const actualKeys = rootKeys.sort();

    expect(actualKeys).toEqual(expectedKeys);
  });
});
