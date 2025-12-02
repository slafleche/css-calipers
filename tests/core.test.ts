import { describe, expect, it } from 'vitest';
import {
  assertMatchingUnits,
  isMeasurement,
  m,
  mPercent,
  mPx,
  mCqw,
  makeUnitAssert,
  makeUnitGuard,
  measurementMax,
  measurementMin,
} from '../src';

describe('CSS-Calipers core helpers', () => {
  it('creates lowercase units and exposes css/value helpers', () => {
    const measurement = m(12.5, 'PX');
    expect(measurement.css()).toBe('12.5px');
    expect(measurement.getUnit()).toBe('px');
    expect(measurement.getValue()).toBe(12.5);
    expect(measurement.toString()).toBe('12.5px');
  });

  it('performs arithmetic safely within the same unit', () => {
    const base = m(10);
    expect(base.add(5).css()).toBe('15px');
    expect(base.subtract(m(2)).getValue()).toBe(8);
    expect(base.multiply(2).css()).toBe('20px');
    expect(base.divide(2).css()).toBe('5px');
  });

  it('throws when mixing units without conversion', () => {
    const px = m(10);
    const em = m(1, 'em');
    expect(() => px.add(em)).toThrow(/measurement unit mismatch/i);
    expect(() => assertMatchingUnits(px, em, 'test')).toThrow(
      /measurement unit mismatch/i,
    );
  });

  it('supports rounding helpers', () => {
    const measurement = m(3.14159);
    expect(measurement.round(2).css()).toBe('3.14px');
    expect(measurement.floor().css()).toBe('3px');
    expect(measurement.ceil().css()).toBe('4px');
    expect(measurement.negation().css()).toBe('-3.14159px');
    expect(measurement.absolute().css()).toBe('3.14159px');
  });

  it('clamps values between given minimum and maximum', () => {
    const value = m(15);
    const clamped = value.clamp(m(10), m(12));
    expect(clamped.css()).toBe('12px');

    expect(() => value.clamp(m(20), m(12))).toThrow(/must be <= max/);
  });

  it('computes min and max for matching units', () => {
    const small = m(1);
    const big = m(2);
    expect(measurementMin(small, big)).toBe(small);
    expect(measurementMax(small, big)).toBe(big);
  });

  it('exposes helpers generated from unit definitions', () => {
    const percent = mPercent(50);
    expect(percent.css()).toBe('50%');
    expect(percent.getUnit()).toBe('%');

    const px = mPx(4);
    expect(px.css()).toBe('4px');

    const containerWidth = mCqw(25);
    expect(containerWidth.css()).toBe('25cqw');
  });

  it('provides guards and assertions for unit helpers', () => {
    const guard = makeUnitGuard(mPx);
    const assertPx = makeUnitAssert(mPx);

    expect(guard(m(4))).toBe(true);
    expect(guard(m(4, 'em'))).toBe(false);

    expect(() => assertPx(m(1, 'em'), 'ctx')).toThrow(
      /Expected unit "px"/,
    );

    expect(() => assertPx(m(2))).not.toThrow();
  });

  it('identifies Measurement instances via isMeasurement', () => {
    expect(isMeasurement(m(1))).toBe(true);
    expect(isMeasurement({ css: () => 'fake' })).toBe(false);
  });

  it('rejects division by zero', () => {
    const measurement = m(10);
    expect(() => measurement.divide(0)).toThrow(/Cannot divide/);
  });
});

