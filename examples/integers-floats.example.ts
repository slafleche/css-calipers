/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates the `i()`
 * (integer) and `f()` (float) number primitives: native typed CSS scalars alongside
 * `m()`. Each carries optional range constraints that re-validate through arithmetic,
 * so a hardened value stays hardened (or throws). `clamp(min, max)` snaps instead of
 * throwing; `hardenInteger` / `hardenFloat` bind a constraint set into a reusable
 * factory (the scalar analogue of a unit helper).
 */

import {
  f,
  hardenFloat,
  hardenInteger,
  i,
} from '@css-bookends/css-calipers';

// --- construction and render ----------------------------------------------------

export const intValue = i(42).css(); // '42'
export const floatValue = f(0.5).css(); // '0.5'

// --- arithmetic re-validates against the same constraints -----------------------

// Integer arithmetic stays integer; the result is re-checked, so integer-ness
// survives.
export const added = i(4).add(2).css(); // '6'
export const multiplied = i(4).multiply(3).value(); // 12

// Float arithmetic re-validates too.
export const floatAdded = f(0.5).add(0.25).css(); // '0.75'

// --- range constraints that THROW -----------------------------------------------

// A non-integer is rejected at construction.
export const nonIntegerThrows = (): string => {
  try {
    i(2.5);
    return 'no throw';
  } catch (error) {
    // 'i: expected an integer (got 2.5)'
    return error instanceof Error ? error.message : 'unknown';
  }
};

// Below the minimum throws.
export const belowMinThrows = (): string => {
  try {
    i(0, { min: 1 });
    return 'no throw';
  } catch (error) {
    // 'i: 0 is below the minimum 1'
    return error instanceof Error ? error.message : 'unknown';
  }
};

// Above the maximum throws (float here).
export const aboveMaxThrows = (): string => {
  try {
    f(1.1, { max: 1 });
    return 'no throw';
  } catch (error) {
    // 'f: 1.1 is above the maximum 1'
    return error instanceof Error ? error.message : 'unknown';
  }
};

// Arithmetic that crosses a bound throws on re-validation.
export const arithmeticThrows = (): string => {
  try {
    i(5, { max: 10 }).add(20);
    return 'no throw';
  } catch (error) {
    // 'i: 25 is above the maximum 10'
    return error instanceof Error ? error.message : 'unknown';
  }
};

// --- clamp(min, max): snap to range instead of throwing -------------------------

export const clampedHigh = i(15).clamp(0, 10).value(); // 10
export const clampedLow = i(-3).clamp(0, 10).value(); // 0
export const floatClamped = f(1.5).clamp(0, 1).value(); // 1

// --- hardenInteger / hardenFloat: reusable bound factories ----------------------

// A font-weight value is an integer in [1, 1000]; bind it once, reuse it.
const fontWeight = hardenInteger({ min: 1, max: 1000 });
export const validWeight = fontWeight(700).css(); // '700'
export const weightThrows = (): string => {
  try {
    fontWeight(1200);
    return 'no throw';
  } catch (error) {
    // 'i: 1200 is above the maximum 1000'
    return error instanceof Error ? error.message : 'unknown';
  }
};

// An opacity value is a float in [0, 1]; same pattern.
const opacity = hardenFloat({ min: 0, max: 1 });
export const validOpacity = opacity(0.25).css(); // '0.25'
export const opacityThrows = (): string => {
  try {
    opacity(1.5);
    return 'no throw';
  } catch (error) {
    // 'f: 1.5 is above the maximum 1'
    return error instanceof Error ? error.message : 'unknown';
  }
};
