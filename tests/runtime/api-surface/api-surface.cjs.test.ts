// API-surface contract test for the built CommonJS bundle.
// This file focuses on export presence and basic shapes, not behavior.
import { describe, expect, it } from 'vitest';

const cjsRoot = await import('../../../dist/cjs/index.js');
const cjsUnits = await import('../../../dist/cjs/units/index.js');

const cjsUnitsPercent =
  await import('../../../dist/cjs/units/percent.js');
const cjsUnitsAbsolute =
  await import('../../../dist/cjs/units/absolute.js');
const cjsUnitsFontRelative =
  await import('../../../dist/cjs/units/font-relative.js');
const cjsUnitsViewport =
  await import('../../../dist/cjs/units/viewport.js');
const cjsUnitsViewportSmall =
  await import('../../../dist/cjs/units/viewport-small.js');
const cjsUnitsViewportLarge =
  await import('../../../dist/cjs/units/viewport-large.js');
const cjsUnitsViewportDynamic =
  await import('../../../dist/cjs/units/viewport-dynamic.js');
const cjsUnitsContainer =
  await import('../../../dist/cjs/units/container.js');
const cjsUnitsAngle =
  await import('../../../dist/cjs/units/angle.js');
const cjsUnitsTime = await import('../../../dist/cjs/units/time.js');
const cjsUnitsFrequency =
  await import('../../../dist/cjs/units/frequency.js');
const cjsUnitsResolution =
  await import('../../../dist/cjs/units/resolution.js');
const cjsUnitsGrid = await import('../../../dist/cjs/units/grid.js');

describe('API surface (CJS)', () => {
  it('exposes expected core exports from the root entrypoint', () => {
    expect(cjsRoot).toHaveProperty('m');
    expect(typeof cjsRoot.m).toBe('function');

    expect(cjsRoot).toHaveProperty('assertUnit');
    expect(typeof cjsRoot.assertUnit).toBe('function');
  });

  it('exposes unit helpers via the units aggregator', () => {
    expect(cjsUnits).toHaveProperty('mPercent');
    expect(typeof cjsUnits.mPercent).toBe('function');

    expect(cjsUnits).toHaveProperty('mPx');
    expect(typeof cjsUnits.mPx).toBe('function');

    expect(cjsUnits).toHaveProperty('mEm');
    expect(typeof cjsUnits.mEm).toBe('function');

    expect(cjsUnits).toHaveProperty('mVw');
    expect(typeof cjsUnits.mVw).toBe('function');

    expect(cjsUnits).toHaveProperty('mSvw');
    expect(typeof cjsUnits.mSvw).toBe('function');

    expect(cjsUnits).toHaveProperty('mLvw');
    expect(typeof cjsUnits.mLvw).toBe('function');

    expect(cjsUnits).toHaveProperty('mDvw');
    expect(typeof cjsUnits.mDvw).toBe('function');

    expect(cjsUnits).toHaveProperty('mCqw');
    expect(typeof cjsUnits.mCqw).toBe('function');

    expect(cjsUnits).toHaveProperty('mDeg');
    expect(typeof cjsUnits.mDeg).toBe('function');

    expect(cjsUnits).toHaveProperty('mS');
    expect(typeof cjsUnits.mS).toBe('function');

    expect(cjsUnits).toHaveProperty('mHz');
    expect(typeof cjsUnits.mHz).toBe('function');

    expect(cjsUnits).toHaveProperty('mDpi');
    expect(typeof cjsUnits.mDpi).toBe('function');

    expect(cjsUnits).toHaveProperty('mFr');
    expect(typeof cjsUnits.mFr).toBe('function');
  });

  it('exposes unit helpers via unit family subpaths', () => {
    expect(cjsUnitsPercent).toHaveProperty('mPercent');
    expect(typeof cjsUnitsPercent.mPercent).toBe('function');

    expect(cjsUnitsAbsolute).toHaveProperty('mPx');
    expect(typeof cjsUnitsAbsolute.mPx).toBe('function');

    expect(cjsUnitsFontRelative).toHaveProperty('mEm');
    expect(typeof cjsUnitsFontRelative.mEm).toBe('function');

    expect(cjsUnitsViewport).toHaveProperty('mVw');
    expect(typeof cjsUnitsViewport.mVw).toBe('function');

    expect(cjsUnitsViewportSmall).toHaveProperty('mSvw');
    expect(typeof cjsUnitsViewportSmall.mSvw).toBe('function');

    expect(cjsUnitsViewportLarge).toHaveProperty('mLvw');
    expect(typeof cjsUnitsViewportLarge.mLvw).toBe('function');

    expect(cjsUnitsViewportDynamic).toHaveProperty('mDvw');
    expect(typeof cjsUnitsViewportDynamic.mDvw).toBe('function');

    expect(cjsUnitsContainer).toHaveProperty('mCqw');
    expect(typeof cjsUnitsContainer.mCqw).toBe('function');

    expect(cjsUnitsAngle).toHaveProperty('mDeg');
    expect(typeof cjsUnitsAngle.mDeg).toBe('function');

    expect(cjsUnitsTime).toHaveProperty('mS');
    expect(typeof cjsUnitsTime.mS).toBe('function');

    expect(cjsUnitsFrequency).toHaveProperty('mHz');
    expect(typeof cjsUnitsFrequency.mHz).toBe('function');

    expect(cjsUnitsResolution).toHaveProperty('mDpi');
    expect(typeof cjsUnitsResolution.mDpi).toBe('function');

    expect(cjsUnitsGrid).toHaveProperty('mFr');
    expect(typeof cjsUnitsGrid.mFr).toBe('function');
  });

  it('exposes the full root runtime export map', () => {
    // `__esModule` and `default` are CJS<->ESM interop artifacts on the namespace
    // (the dynamic `import()` of a CJS bundle synthesizes a `default`), not part of the
    // package's real named API surface.
    const rootKeys = Object.keys(cjsRoot).filter(
      (key) => key !== '__esModule' && key !== 'default',
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
      'makeMeasurementRefinement',
      'nonNegative',
      'nonPositive',
      'inRange',
      'normalizeRatio',
      'parseRatio',
      'ratioToFloat',
      'toFloat',
      'reduceRatio',
      'simplifyRatio',
      'i',
      'f',
      'isInteger',
      'isFloat',
      'hardenInteger',
      'hardenFloat',
      'createInteger',
      'createFloat',
      'createCalipersBundle',
      'isPercentMeasurement',
      'assertPercentMeasurement',
      'getErrorConfig',
      'setErrorConfig',
      // colour value surface (re-exported from ./color)
      'color',
      'colorFormats',
      'createColor',
      'defaultColorConfig',
      'defaultFormatPriority',
      'defineColorSpace',
      'parseColor',
      'resolveColor',
      'storeColor',
    ];

    const unitHelperKeys = Object.keys(
      cjsRoot.measurementUnitMetadata,
    );

    const expectedKeys = [
      ...coreRuntimeKeys,
      ...unitHelperKeys,
    ].sort();
    const actualKeys = rootKeys.sort();

    expect(actualKeys).toEqual(expectedKeys);
  });
});
