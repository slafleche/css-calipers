import { describe, expect, it } from 'vitest';

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
});
