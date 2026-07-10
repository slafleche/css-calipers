import { describe, expect, it } from 'vitest';

import {
  inRange,
  m,
  makeMeasurementRefinement,
  mPercent,
  nonNegative,
  nonPositive,
} from '../../../src';
import { createCalipers } from '../../../src/factory';

/*
 * Value-constraint refinements. Each refinement runs a measurement through a runtime
 * check and (at the type level, see tests/types/refinement.test-d.ts) narrows it to the
 * matching brand. Behavior: the value is unchanged - the same instance is returned on
 * success - and an out-of-range value is rejected. Real assertions.
 */

describe('nonNegative (>= 0)', () => {
  describe('is', () => {
    it('is true for positive and zero, false for negative', () => {
      expect(nonNegative.is(m(4))).toBe(true);
      expect(nonNegative.is(m(0))).toBe(true);
      expect(nonNegative.is(m(-1))).toBe(false);
    });
  });

  describe('ensure', () => {
    it('returns the same instance for a valid value', () => {
      const v = m(4);
      expect(nonNegative.ensure(v)).toBe(v);
    });

    it('accepts zero', () => {
      expect(nonNegative.ensure(m(0)).getValue()).toBe(0);
    });

    it('throws on a negative value', () => {
      expect(() => nonNegative.ensure(m(-1))).toThrow();
    });

    it('reports the constraint, the offending value, and the error code', () => {
      expect(() => nonNegative.ensure(m(-4, 'px'))).toThrow(/>= 0/);
      expect(() => nonNegative.ensure(m(-4, 'px'))).toThrow(/-4px/);
      expect(() => nonNegative.ensure(m(-4))).toThrow(
        /CALIPERS_E_CONSTRAINT/,
      );
    });

    it('includes the optional context in the message', () => {
      expect(() => nonNegative.ensure(m(-4), 'padding.top')).toThrow(
        /padding\.top/,
      );
    });

    it('preserves the value and unit', () => {
      const out = nonNegative.ensure(m(4, 'em'));
      expect(out.getValue()).toBe(4);
      expect(out.getUnit()).toBe('em');
    });

    it('is unit-agnostic (percentages)', () => {
      const v = mPercent(50);
      expect(nonNegative.ensure(v)).toBe(v);
    });
  });

  describe('check', () => {
    it('returns ok with the same instance for a valid value', () => {
      const v = m(2);
      const r = nonNegative.check(v);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(v);
    });

    it('returns an error result for an invalid value, without throwing', () => {
      const v = m(-2);
      const r = nonNegative.check(v);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.value).toBe(v);
        expect(r.error).toContain('>= 0');
      }
    });
  });

  describe('hardenWith', () => {
    it('returns the input when valid', () => {
      const v = m(4);
      expect(nonNegative.hardenWith(v)).toBe(v);
    });

    it('falls back to zero in the candidate unit when invalid', () => {
      expect(nonNegative.hardenWith(m(-4, 'px')).css()).toBe('0px');
      expect(nonNegative.hardenWith(m(-4, 'em')).css()).toBe('0em');
      expect(nonNegative.hardenWith(mPercent(-50)).css()).toBe('0%');
    });

    it('honors an explicit fallback', () => {
      const fallback = nonNegative.ensure(m(8));
      expect(nonNegative.hardenWith(m(-4), fallback)).toBe(fallback);
    });
  });
});

describe('nonPositive (<= 0)', () => {
  it('is true for negative and zero, false for positive', () => {
    expect(nonPositive.is(m(-4))).toBe(true);
    expect(nonPositive.is(m(0))).toBe(true);
    expect(nonPositive.is(m(1))).toBe(false);
  });

  it('ensure passes negatives and zero, throws on positive', () => {
    const v = m(-4);
    expect(nonPositive.ensure(v)).toBe(v);
    expect(nonPositive.ensure(m(0)).getValue()).toBe(0);
    expect(() => nonPositive.ensure(m(1))).toThrow(/<= 0/);
  });

  it('check returns an error result for a positive value', () => {
    const r = nonPositive.check(m(5));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('<= 0');
  });

  it('hardenWith falls back to zero when invalid', () => {
    expect(nonPositive.hardenWith(m(4, 'em')).css()).toBe('0em');
  });
});

describe('inRange(min, max)', () => {
  it('throws at construction when min > max', () => {
    expect(() => inRange(10, 0)).toThrow(/min .* must be <= max/);
  });

  it('allows a degenerate range (min === max)', () => {
    const exact = inRange(5, 5);
    expect(exact.is(m(5))).toBe(true);
    expect(exact.is(m(4))).toBe(false);
  });

  it('bounds are inclusive', () => {
    const between = inRange(0, 10);
    expect(between.is(m(0))).toBe(true);
    expect(between.is(m(10))).toBe(true);
  });

  it('ensure passes in-range, rejects out-of-range on either side', () => {
    const between = inRange(0, 10);
    const v = m(4);
    expect(between.ensure(v)).toBe(v);
    expect(() => between.ensure(m(-1))).toThrow(/\[0, 10\]/);
    expect(() => between.ensure(m(11))).toThrow(/\[0, 10\]/);
  });

  it('supports negative ranges', () => {
    const between = inRange(-10, -2);
    expect(between.is(m(-5))).toBe(true);
    expect(between.is(m(0))).toBe(false);
  });

  it('hardenWith defaults to min when invalid', () => {
    expect(inRange(2, 10).hardenWith(m(0)).css()).toBe('2px');
  });

  it('hardenWith honors an explicit fallback', () => {
    const between = inRange(0, 10);
    const fallback = between.ensure(m(5));
    expect(between.hardenWith(m(99), fallback)).toBe(fallback);
  });
});

describe('makeMeasurementRefinement (custom constraints)', () => {
  const even = makeMeasurementRefinement<{ readonly even: true }>({
    predicate: (value) => value % 2 === 0,
    message: (measurement) =>
      `expected an even value (got ${measurement.css()})`,
  });

  it('builds a working guard / ensure / check', () => {
    expect(even.is(m(4))).toBe(true);
    expect(even.is(m(3))).toBe(false);
    expect(even.ensure(m(4)).getValue()).toBe(4);
    expect(() => even.ensure(m(3))).toThrow(/even/);
    expect(even.check(m(3)).ok).toBe(false);
  });

  it('hardenWith without a default returns the input when valid', () => {
    const v = m(4);
    expect(even.hardenWith(v)).toBe(v);
  });

  it('hardenWith without a default uses an explicit fallback when invalid', () => {
    const fallback = even.ensure(m(2));
    expect(even.hardenWith(m(3), fallback)).toBe(fallback);
  });

  it('hardenWith without a default and no fallback throws', () => {
    expect(() => even.hardenWith(m(3))).toThrow(/no fallback/);
    expect(() => even.hardenWith(m(3))).toThrow(
      /CALIPERS_E_CONSTRAINT/,
    );
  });
});

describe('createCalipers() instances expose the refinements', () => {
  const calipers = createCalipers();

  it('provides nonNegative / nonPositive / inRange / makeMeasurementRefinement', () => {
    expect(typeof calipers.nonNegative.ensure).toBe('function');
    expect(typeof calipers.nonPositive.ensure).toBe('function');
    expect(typeof calipers.inRange).toBe('function');
    expect(typeof calipers.makeMeasurementRefinement).toBe(
      'function',
    );
  });

  it('behaves the same as the default exports', () => {
    const v = calipers.m(4);
    expect(calipers.nonNegative.ensure(v)).toBe(v);
    expect(() =>
      calipers.nonNegative.ensure(calipers.m(-1)),
    ).toThrow();
    expect(calipers.inRange(0, 10).is(calipers.m(5))).toBe(true);
  });
});
