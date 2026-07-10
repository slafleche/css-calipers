// NOTE: This file is being refactored in phases to use a shared
// `runCoreTests` helper defined in tests/runtime/core/core.shared.ts. If you
// need to restore the original single-environment layout, use README.md.bak
// and the git history for reference.
import { describe, expect, it } from 'vitest';

import {
  assertCondition,
  assertMatchingUnits,
  assertPercentMeasurement,
  assertUnit,
  f,
  getErrorConfig,
  hasCssMethod,
  i,
  isMeasurement,
  isPercentMeasurement,
  m,
  makeUnitAssert,
  makeUnitGuard,
  makeUnitHelper,
  makeUnitHelperFromDefinition,
  mCm,
  mCqh,
  mCqw,
  mDeg,
  mDpi,
  mDvw,
  measurementMax,
  measurementMin,
  measurementUnitMetadata,
  mEm,
  mFr,
  mKhz,
  mLvw,
  mMs,
  mPercent,
  mPx,
  mSvw,
  mVh,
  setErrorConfig,
} from '../../../src';
import type { CoreApi } from './core.shared';
import { runCoreTests } from './core.shared';

const api = {
  m,
  mPercent,
  mPx,
  mCm,
  mEm,
  mVh,
  mSvw,
  mLvw,
  mDvw,
  mCqh,
  mDeg,
  mMs,
  mKhz,
  mDpi,
  mFr,
  mCqw,
  assertMatchingUnits,
  assertUnit,
  assertCondition,
  isMeasurement,
  isPercentMeasurement,
  assertPercentMeasurement,
  makeUnitHelper,
  makeUnitHelperFromDefinition,
  measurementUnitMetadata,
  makeUnitAssert,
  makeUnitGuard,
  hasCssMethod,
  measurementMin,
  measurementMax,
  setErrorConfig,
  getErrorConfig,
} as unknown as CoreApi;

runCoreTests('src', api);

describe('Measurement arithmetic with typed scalar operands (i / f)', () => {
  it('multiplies by a typed integer or float factor', () => {
    expect(m(8).multiply(i(2)).css()).toBe('16px');
    expect(m(8).multiply(f(1.5)).css()).toBe('12px');
    // plain-number factors still work
    expect(m(8).multiply(2).css()).toBe('16px');
  });

  it('divides by a typed integer or float divisor', () => {
    expect(m(8).divide(i(2)).css()).toBe('4px');
    expect(m(9).divide(f(1.5)).css()).toBe('6px');
    // plain-number divisors still work
    expect(m(8).divide(2).css()).toBe('4px');
  });

  it('throws CALIPERS_E_DIVIDE_BY_ZERO when the typed divisor is zero', () => {
    expect(() => m(8).divide(i(0))).toThrow(
      /CALIPERS_E_DIVIDE_BY_ZERO/,
    );
    expect(() => m(8).divide(f(0))).toThrow(
      /CALIPERS_E_DIVIDE_BY_ZERO/,
    );
  });
});

describe('m() accepts typed scalar (i / f) inputs', () => {
  it('builds a measurement from an integer or float value', () => {
    expect(m(i(4)).css()).toBe('4px');
    expect(m(f(1.5)).css()).toBe('1.5px');
  });

  it('honours the unit + options forms with a typed scalar value', () => {
    expect(m(i(4), 'rem').css()).toBe('4rem');
    expect(m(f(2.5), { unit: 'em' }).css()).toBe('2.5em');
  });

  it('plain numbers still work unchanged', () => {
    expect(m(8).css()).toBe('8px');
    expect(m(8, 'rem').css()).toBe('8rem');
  });
});
