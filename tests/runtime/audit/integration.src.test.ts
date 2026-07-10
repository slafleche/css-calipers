import { describe, expect, it } from 'vitest';

import { createCalipers } from '../../../src/factory';
import {
  inRange,
  m,
  nonNegative,
  nonPositive,
} from '../../../src/index';

/*
 * Publish-readiness: CROSS-MODULE INTEGRATION.
 *
 * The unit primitives, the value-constraint refinements, and the factory are
 * independent modules. These flows exercise them TOGETHER, the way a consumer
 * wires a design token, to catch a regression that only shows up at a module
 * boundary.
 */

describe('measurement + refinement + arithmetic in one flow', () => {
  it('hardens an API value, does math, and re-checks the result', () => {
    // Untrusted input -> absolute() (hardened non-negative) -> arithmetic
    // (drops the brand) -> re-check before use.
    const raw = m(-12, 'px');
    const safe = raw.absolute(); // NonNegativeMeasurement<'px'>
    expect(nonNegative.is(safe)).toBe(true);

    const scaled = safe.multiply(2).subtract(m(4, 'px')); // 20px
    expect(scaled.css()).toBe('20px');

    // The brand was dropped by arithmetic; re-checking succeeds at runtime.
    const rechecked = nonNegative.ensure(scaled);
    expect(rechecked.getValue()).toBe(20);
  });

  it('an inRange refinement composes with clamp on the same unit', () => {
    const within = inRange(0, 100);
    const clamped = m(150, 'px').clamp(m(0, 'px'), m(100, 'px'));
    expect(within.is(clamped)).toBe(true);
    expect(clamped.css()).toBe('100px');
  });

  it('a constraint failure after arithmetic throws the constraint code', () => {
    const safe = m(2, 'px').absolute();
    const negative = safe.subtract(m(10, 'px')); // -8px, brand dropped
    expect(() => nonNegative.ensure(negative)).toThrow(
      /CALIPERS_E_CONSTRAINT/,
    );
  });

  it('a nonPositive value, post-arithmetic, re-checks (succeeds then throws)', () => {
    // mirror of the nonNegative flow for the <= 0 brand: harden a value nonPositive,
    // run arithmetic (which drops the brand), then re-check before use.
    const safe = nonPositive.ensure(m(-12, 'px')); // SmallerOrEqualToZeroBrand
    expect(nonPositive.is(safe)).toBe(true);

    // arithmetic that STAYS in range: -12 * 2 = -24px, still <= 0, re-check passes.
    // (the brand is dropped at the TYPE level; the runtime predicate is value-based,
    // so -24 is still <= 0 and `is` reports true.)
    const scaledDown = safe.multiply(2); // -24px, brand dropped
    expect(nonPositive.is(scaledDown)).toBe(true);
    const rechecked = nonPositive.ensure(scaledDown);
    expect(rechecked.getValue()).toBe(-24);
    expect(rechecked.css()).toBe('-24px');

    // arithmetic that CROSSES zero: -12 + 30 = +18px, re-check throws the code.
    const crossed = safe.add(m(30, 'px')); // 18px, brand dropped, now positive
    expect(() => nonPositive.ensure(crossed)).toThrow(/<= 0/);
    expect(() => nonPositive.ensure(crossed)).toThrow(
      /CALIPERS_E_CONSTRAINT/,
    );
  });
});

describe('the factory instance integrates the same way as the bare defaults', () => {
  it('a custom instance hardens and computes identically', () => {
    const c = createCalipers();
    const safe = c.m(-3, 'em').absolute();
    expect(c.nonNegative.is(safe)).toBe(true);
    expect(safe.multiply(4).css()).toBe('12em');
    expect(c.inRange(0, 20).is(safe.multiply(4))).toBe(true);
  });

  it('an instance with error config still throws on bad arithmetic', () => {
    const c = createCalipers({ errorConfig: { stackHints: 'off' } });
    expect(() => c.m(1, 'px').divide(0)).toThrow(
      /CALIPERS_E_DIVIDE_BY_ZERO/,
    );
    // stack hints disabled: the message must NOT carry a stack= segment.
    try {
      c.m(1, 'px').divide(0);
    } catch (err) {
      expect((err as Error).message).not.toMatch(/stack=/);
    }
  });
});
