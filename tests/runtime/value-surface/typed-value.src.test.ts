// Value introspection + interconversion: .isInt() / .isFloat() (by the numeric
// value) and .toTypedValue() (recover the matching unitless i() / f()). Uniform
// across m / i / f.
import { describe, expect, it } from 'vitest';

import { f, i, m } from '../../../src';

describe('value introspection: .isInt() / .isFloat()', () => {
  it('measurement reflects its numeric value', () => {
    expect(m(8).isInt()).toBe(true);
    expect(m(8).isFloat()).toBe(false);
    expect(m(2.5, 'rem').isFloat()).toBe(true);
    expect(m(2.5, 'rem').isInt()).toBe(false);
  });

  it('integer is always integral', () => {
    expect(i(4).isInt()).toBe(true);
    expect(i(4).isFloat()).toBe(false);
  });

  it('float reflects its value (integral-valued float is int)', () => {
    expect(f(2.5).isFloat()).toBe(true);
    expect(f(2.5).isInt()).toBe(false);
    expect(f(3).isInt()).toBe(true);
  });
});

describe('value interconversion: .toTypedValue()', () => {
  it('measurement -> unitless i / f by value', () => {
    const ti = m(8).toTypedValue();
    expect(ti.value()).toBe(8);
    expect(ti.unit()).toBe('');
    expect(ti.isInt()).toBe(true);

    const tf = m(2.5, 'rem').toTypedValue();
    expect(tf.value()).toBe(2.5);
    expect(tf.isFloat()).toBe(true);
  });

  it('integer -> i; float -> i when integral, f when fractional', () => {
    expect(i(4).toTypedValue().value()).toBe(4);
    expect(i(4).toTypedValue().isInt()).toBe(true);
    expect(f(3).toTypedValue().isInt()).toBe(true);
    expect(f(2.5).toTypedValue().isFloat()).toBe(true);
  });
});
