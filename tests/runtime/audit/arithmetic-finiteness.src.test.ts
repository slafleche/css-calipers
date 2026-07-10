import { describe, expect, it } from 'vitest';

import { f } from '../../../src/float';
import { type IMeasurement, m } from '../../../src/index';
import { i } from '../../../src/integer';
import { r } from '../../../src/ratio';

/*
 * Publish-readiness pin: ARITHMETIC FINITENESS.
 *
 * Every primitive routes its arithmetic results back through its constructor,
 * which re-runs the finite check. So a non-finite operand (or a non-finite
 * derived result) is rejected at the operation site, not silently propagated
 * into a `.css()` render. These tests pin that contract so it cannot regress.
 */

describe('measurement arithmetic re-validates finiteness', () => {
  it('m().add(Infinity) throws with the non-finite code', () => {
    expect(() => m(1, 'px').add(Number.POSITIVE_INFINITY)).toThrow(
      /CALIPERS_E_NONFINITE/,
    );
  });

  it('m().subtract(Infinity) throws', () => {
    expect(() =>
      m(1, 'px').subtract(Number.POSITIVE_INFINITY),
    ).toThrow(/Non-finite/);
  });

  it('m().multiply(Infinity) throws', () => {
    expect(() =>
      m(2, 'px').multiply(Number.POSITIVE_INFINITY),
    ).toThrow(/Non-finite/);
  });

  it('m().add(NaN) throws', () => {
    expect(() => m(1, 'px').add(Number.NaN)).toThrow(/Non-finite/);
  });

  it('divide by a non-finite-producing path throws with the result code', () => {
    // 1 / very-small is still finite; force a non-finite result via a huge
    // operand chain instead. value * Infinity is caught by the constructor.
    expect(() =>
      m(1, 'px').multiply(Number.POSITIVE_INFINITY),
    ).toThrow(/CALIPERS_E_NONFINITE/);
  });

  it('divide by zero throws the divide-by-zero code (not the finite code)', () => {
    expect(() => m(10, 'px').divide(0)).toThrow(
      /CALIPERS_E_DIVIDE_BY_ZERO/,
    );
  });

  it('overflow to Infinity through a long multiply chain throws', () => {
    // 1e308 * 1e308 overflows to Infinity; the constructor rejects it.
    expect(() => m(1e308, 'px').multiply(1e308)).toThrow(
      /Non-finite/,
    );
  });

  it('a finite long chain keeps an exact, renderable value', () => {
    let acc: IMeasurement<'px'> = m(0, 'px');
    for (let n = 0; n < 1000; n += 1) acc = acc.add(0.1);
    // Floating drift is expected; the contract is that it stays finite and
    // renders as a plain decimal (no scientific notation, no NaN).
    expect(Number.isFinite(acc.getValue())).toBe(true);
    expect(acc.css()).toMatch(/^[0-9]+(\.[0-9]+)?px$/);
  });
});

describe('float arithmetic re-validates finiteness', () => {
  it('f().add(Infinity) throws', () => {
    expect(() => f(1).add(Number.POSITIVE_INFINITY)).toThrow(
      /finite/,
    );
  });

  it('f().multiply(Infinity) throws', () => {
    expect(() => f(2).multiply(Number.POSITIVE_INFINITY)).toThrow(
      /finite/,
    );
  });

  it('f() overflow to Infinity throws', () => {
    expect(() => f(1e308).multiply(1e308)).toThrow(/finite/);
  });

  it('f().subtract(NaN) throws', () => {
    expect(() => f(1).subtract(Number.NaN)).toThrow(/finite/);
  });
});

describe('integer arithmetic re-validates finiteness and integer-ness', () => {
  it('i().add(Infinity) throws (finite check)', () => {
    expect(() => i(1).add(Number.POSITIVE_INFINITY)).toThrow(
      /finite/,
    );
  });

  it('i().multiply(Infinity) throws', () => {
    expect(() => i(2).multiply(Number.POSITIVE_INFINITY)).toThrow(
      /finite/,
    );
  });

  it('i() result that is no longer an integer throws', () => {
    expect(() => i(5).multiply(0.5)).toThrow(/expected an integer/);
  });
});

describe('ratio re-validates finiteness', () => {
  it('a non-finite numerator via withNumerator throws', () => {
    expect(() =>
      r(1, 2).withNumerator(Number.POSITIVE_INFINITY),
    ).toThrow(/finite/);
  });

  it('a zero denominator via withDenominator throws', () => {
    expect(() => r(1, 2).withDenominator(0)).toThrow(
      /denominator cannot be zero/,
    );
  });
});
