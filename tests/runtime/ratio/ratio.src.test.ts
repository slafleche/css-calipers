import { describe, expect, it } from 'vitest';

import { f, isFloat } from '../../../src/float';
import { i, isInteger } from '../../../src/integer';
import {
  isRatio,
  normalizeRatio,
  parseRatio,
  r,
  ratioToFloat,
  reduceRatio,
  simplifyRatio,
  toFloat,
} from '../../../src/ratio';

describe('Ratio helper (src)', () => {
  it('creates ratios with implied denominator', () => {
    const ratio = r(4);
    expect(ratio.numerator()).toBe(4);
    expect(ratio.denominator()).toBe(1);
    expect(ratio.css()).toBe('4/1');
    expect(ratio.toString()).toBe('4/1');
    expect(ratio.valueOf()).toBe(4);
  });

  it('creates ratios with explicit numerator and denominator', () => {
    const ratio = r(3, 5);
    expect(ratio.numerator()).toBe(3);
    expect(ratio.denominator()).toBe(5);
    expect(ratio.css()).toBe('3/5');
    expect(ratio.valueOf()).toBe(0.6);
  });

  it('supports simplify option on creation', () => {
    expect(r(6, 3, { simplify: true }).css()).toBe('2');
    expect(r(6, 3).css()).toBe('6/3');
    expect(r(5, { simplify: true }).css()).toBe('5');
  });

  it('creates new ratios when replacing numerator or denominator', () => {
    const base = r(2, 3);
    const withNumerator = base.withNumerator(4);
    const withDenominator = base.withDenominator(5);

    expect(base.css()).toBe('2/3');
    expect(withNumerator.css()).toBe('4/3');
    expect(withDenominator.css()).toBe('2/5');
  });

  it('detects ratios', () => {
    expect(isRatio(r(2, 3))).toBe(true);
    expect(isRatio({})).toBe(false);
    expect(isRatio(null)).toBe(false);
  });

  it('parses ratio inputs', () => {
    expect(parseRatio(2)).toEqual({ numerator: 2, denominator: 1 });
    expect(parseRatio(-2)).toEqual({ numerator: -2, denominator: 1 });
    expect(parseRatio('3/4')).toEqual({
      numerator: 3,
      denominator: 4,
    });
    expect(parseRatio('3:4')).toEqual({
      numerator: 3,
      denominator: 4,
    });
    expect(parseRatio('-3/4')).toEqual({
      numerator: -3,
      denominator: 4,
    });
    expect(parseRatio('3/-4')).toEqual({
      numerator: 3,
      denominator: -4,
    });
    expect(parseRatio('3 : 5')).toEqual({
      numerator: 3,
      denominator: 5,
    });
    expect(parseRatio('1.5')).toEqual({
      numerator: 1.5,
      denominator: 1,
    });
    expect(parseRatio(r(5, 6))).toEqual({
      numerator: 5,
      denominator: 6,
    });
    expect(parseRatio('')).toBeNull();
    expect(parseRatio('   ')).toBeNull();
    expect(parseRatio('bad')).toBeNull();
    expect(parseRatio('1/0')).toBeNull();
    expect(parseRatio('1/NaN')).toBeNull();
    expect(parseRatio('Infinity')).toBeNull();
    expect(parseRatio(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('normalizes integer ratios', () => {
    expect(normalizeRatio(r(2, 4)).css()).toBe('1/2');
    expect(normalizeRatio(r(-2, -4)).css()).toBe('1/2');
    expect(normalizeRatio(r(-2, 4)).css()).toBe('-1/2');
  });

  it('keeps non-integer ratios as-is', () => {
    const normalized = normalizeRatio(r(1.5, 3.5));
    expect(normalized.css()).toBe('1.5/3.5');
  });

  it('reduces ratios without altering css output style', () => {
    expect(reduceRatio(r(6, 3)).css()).toBe('2/1');
    expect(reduceRatio(r(5)).css()).toBe('5/1');
  });

  it('simplifies ratios and omits denominator when it becomes 1', () => {
    expect(simplifyRatio(r(5)).css()).toBe('5');
    expect(simplifyRatio(r(6, 3)).css()).toBe('2');
    expect(simplifyRatio(r(21, 7)).css()).toBe('3');
  });

  it('converts ratios to floating point values', () => {
    expect(ratioToFloat(r(1, 4))).toBe(0.25);
    expect(ratioToFloat(r(3, 2))).toBe(1.5);
    expect(toFloat(r(1, 4))).toBe(0.25);
  });

  it('rejects invalid values', () => {
    expect(() => r(Number.NaN)).toThrow(
      'Ratio values must be finite numbers.',
    );
    expect(() => r(2, 0)).toThrow(
      'Ratio denominator cannot be zero.',
    );
    expect(() => normalizeRatio(r(Number.NaN))).toThrow(
      'Ratio values must be finite numbers.',
    );
    expect(() => normalizeRatio(r(2, 0))).toThrow(
      'Ratio denominator cannot be zero.',
    );
  });

  it('normalizeRatio re-validates its own input (not only the r() constructor)', () => {
    // r() rejects bad inputs at construction, so the earlier cases never reach
    // normalizeRatio's own guards. A hand-rolled IRatio that bypasses r() proves
    // normalizeRatio independently rejects non-finite numerators and a zero
    // denominator (its defensive re-validation, lines 185-190 of ratio.ts).
    const fakeRatio = (
      numerator: number,
      denominator: number,
    ): Parameters<typeof normalizeRatio>[0] => ({
      css: () => `${numerator}/${denominator}`,
      toString: () => `${numerator}/${denominator}`,
      valueOf: () => numerator / denominator,
      numerator: () => numerator,
      denominator: () => denominator,
      numeratorScalar: () => i(0),
      denominatorScalar: () => i(0),
      withNumerator: () => fakeRatio(numerator, denominator),
      withDenominator: () => fakeRatio(numerator, denominator),
    });

    expect(() => normalizeRatio(fakeRatio(Number.NaN, 2))).toThrow(
      'Ratio values must be finite numbers.',
    );
    expect(() =>
      normalizeRatio(fakeRatio(Number.POSITIVE_INFINITY, 2)),
    ).toThrow('Ratio values must be finite numbers.');
    expect(() => normalizeRatio(fakeRatio(1, 0))).toThrow(
      'Ratio denominator cannot be zero.',
    );
  });

  it('consumes integer and float primitives', () => {
    expect(r(i(16), i(9)).css()).toBe('16/9');
    expect(r(i(16), i(9)).valueOf()).toBeCloseTo(16 / 9);
    expect(r(f(1.5), f(3)).css()).toBe('1.5/3');
    expect(r(i(4)).css()).toBe('4/1');
    expect(r(i(6), i(3), { simplify: true }).css()).toBe('2');
    expect(r(2, 3).withNumerator(i(4)).css()).toBe('4/3');
    expect(parseRatio(i(5))).toEqual({
      numerator: 5,
      denominator: 1,
    });
    expect(parseRatio(f(2.5))).toEqual({
      numerator: 2.5,
      denominator: 1,
    });
  });

  it('returns numerator and denominator back as typed i()/f() scalars', () => {
    // typed operands come back INTACT (same kind that went in)
    const typed = r(i(16), f(9));
    expect(isInteger(typed.numeratorScalar())).toBe(true);
    expect(typed.numeratorScalar().valueOf()).toBe(16);
    expect(isFloat(typed.denominatorScalar())).toBe(true);
    expect(typed.denominatorScalar().valueOf()).toBe(9);

    // raw numbers reconstruct by value: whole -> i(), fractional -> f()
    const raw = r(4, 2.5);
    expect(isInteger(raw.numeratorScalar())).toBe(true);
    expect(raw.numeratorScalar().valueOf()).toBe(4);
    expect(isFloat(raw.denominatorScalar())).toBe(true);
    expect(raw.denominatorScalar().valueOf()).toBe(2.5);

    // a replaced side keeps the new operand's type
    expect(
      isInteger(r(2, 3).withNumerator(i(4)).numeratorScalar()),
    ).toBe(true);
  });
});
