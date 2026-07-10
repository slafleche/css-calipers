import { describe, expect, it } from 'vitest';

import { f } from '../../../src/float';
import { hardenInteger, i, isInteger } from '../../../src/integer';

describe('Integer primitive (src)', () => {
  it('creates an integer and renders it', () => {
    const n = i(42);
    expect(n.value()).toBe(42);
    expect(n.valueOf()).toBe(42);
    expect(n.css()).toBe('42');
    expect(n.toString()).toBe('42');
    expect(+n).toBe(42);
  });

  it('rejects non-integers and non-finite values', () => {
    expect(() => i(2.5)).toThrow(/expected an integer/);
    expect(() => i(Number.NaN)).toThrow(/finite/);
    expect(() => i(Number.POSITIVE_INFINITY)).toThrow(/finite/);
  });

  it('enforces range constraints', () => {
    expect(() => i(0, { min: 1 })).toThrow(/below the minimum/);
    expect(() => i(11, { max: 10 })).toThrow(/above the maximum/);
    expect(i(5, { min: 1, max: 10 }).value()).toBe(5);
    expect(() => i(5, { min: 10, max: 1 })).toThrow(
      /min .* must be <= max/,
    );
  });

  it('re-validates through arithmetic (hardening survives)', () => {
    expect(i(4).add(2).css()).toBe('6');
    expect(i(4).subtract(1).value()).toBe(3);
    expect(i(4).multiply(3).value()).toBe(12);
    expect(i(4).add(i(2)).value()).toBe(6);
    expect(() => i(5).multiply(0.5)).toThrow(/expected an integer/);
    expect(() => i(5, { max: 10 }).add(20)).toThrow(
      /above the maximum/,
    );
  });

  it('clamps within bounds', () => {
    expect(i(15).clamp(0, 10).value()).toBe(10);
    expect(i(-3).clamp(0, 10).value()).toBe(0);
    expect(() => i(5).clamp(10, 0)).toThrow(/min .* must be <= max/);
  });

  it('hardenInteger binds reusable constraints (font-weight)', () => {
    const fontWeight = hardenInteger({ min: 1, max: 1000 });
    expect(fontWeight(700).css()).toBe('700');
    expect(() => fontWeight(1200)).toThrow(/above the maximum/);
    expect(() => fontWeight(0)).toThrow(/below the minimum/);
  });

  it('hardenInteger output RE-VALIDATES its bound through arithmetic', () => {
    // the bound factory clones with the SAME constraints, so a result that leaves
    // [min, max] throws. This proves the harden survives arithmetic, not just .css().
    const fontWeight = hardenInteger({ min: 1, max: 1000 });
    // in-range arithmetic still yields a hardened integer
    expect(fontWeight(700).add(100).value()).toBe(800);
    expect(fontWeight(500).multiply(2).value()).toBe(1000);
    // crossing the upper bound throws on the re-validation
    expect(() => fontWeight(900).add(200)).toThrow(
      /above the maximum/,
    );
    expect(() => fontWeight(600).multiply(2)).toThrow(
      /above the maximum/,
    );
    // crossing the lower bound throws too
    expect(() => fontWeight(100).subtract(200)).toThrow(
      /below the minimum/,
    );
    // a non-integer result still fails integer-ness even within range
    // (701 * 0.5 = 350.5, in range but not whole)
    expect(() => fontWeight(701).multiply(0.5)).toThrow(
      /expected an integer/,
    );
  });

  it('interoperates with typed scalar operands (i / f)', () => {
    // multiply by a typed integer or whole-valued float
    expect(i(4).multiply(i(2)).css()).toBe('8');
    expect(i(4).multiply(f(2)).css()).toBe('8');
    // a fractional float factor yields a non-integer result, which re-validates and throws
    expect(() => i(5).multiply(f(0.5))).toThrow(
      /expected an integer/,
    );
    // add / subtract accept the other typed scalar
    expect(i(4).add(i(3)).css()).toBe('7');
    expect(i(4).subtract(f(1)).css()).toBe('3');
  });

  it('divides and re-validates integer-ness', () => {
    expect(i(6).divide(2).css()).toBe('3');
    expect(i(6).divide(i(2)).css()).toBe('3');
    // a non-integer quotient re-validates through the constructor and throws
    expect(() => i(5).divide(2)).toThrow(/expected an integer/);
    // divide by zero throws (plain number and typed zero)
    expect(() => i(6).divide(0)).toThrow(/divide .* by zero/);
    expect(() => i(6).divide(i(0))).toThrow(/divide .* by zero/);
  });

  it('throws on a non-finite divide RESULT (overflow), before the integer re-validation', () => {
    // MAX_VALUE is a whole number, so it is a valid integer; dividing by a tiny
    // factor overflows to Infinity and hits the non-finite guard, not the
    // divide-by-zero guard and not the integer re-validation.
    expect(() => i(Number.MAX_VALUE).divide(1e-300)).toThrow(
      /non-finite result dividing/,
    );
    expect(() => i(Number.MAX_VALUE).divide(1e-300)).not.toThrow(
      /by zero/,
    );
  });

  it('reports its constraints via constraints()', () => {
    expect(i(5, { min: 1, max: 10 }).constraints()).toEqual({
      min: 1,
      max: 10,
    });
    expect(i(5).constraints()).toEqual({
      min: undefined,
      max: undefined,
    });
  });

  it('detects integers', () => {
    expect(isInteger(i(3))).toBe(true);
    expect(isInteger(3)).toBe(false);
    expect(isInteger({})).toBe(false);
    expect(isInteger(null)).toBe(false);
  });
});
