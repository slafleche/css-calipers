import { describe, expect, it } from 'vitest';
import {
  assertMatchingUnits,
  assertUnit,
  assertCondition,
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
    expect(() => px.add(em)).toThrow(
      'deltaToNumber: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
    expect(() => assertMatchingUnits(px, em, 'test')).toThrow(
      'test: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
    expect(() => assertMatchingUnits(px, em, '')).toThrow(
      'css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
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

    expect(() => value.clamp(m(20), m(12))).toThrow(
      'css-calipers.Measurement.clamp: clamp: min (20px) must be <= max (12px)',
    );
  });

  it('rejects clamp when min or max units differ', () => {
    const value = m(10, 'px');
    const em = m(1, 'em');

    expect(() => value.clamp(em, m(12, 'px'))).toThrow(
      'clamp(min): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
    expect(() => value.clamp(m(8, 'px'), em)).toThrow(
      'clamp(max): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
  });

  it('rejects clamp when bounds are non-finite', () => {
    const value = m(10, 'px');
    const nonFiniteMin = m(Number.NaN, 'px');
    const nonFiniteMax = m(Number.POSITIVE_INFINITY, 'px');

    expect(() => value.clamp(nonFiniteMin, m(12, 'px'))).toThrow(
      'css-calipers.Measurement.clamp: clamp: expected finite bounds',
    );
    expect(() => value.clamp(m(8, 'px'), nonFiniteMax)).toThrow(
      'css-calipers.Measurement.clamp: clamp: expected finite bounds',
    );
  });

  it('computes min and max for matching units', () => {
    const small = m(1);
    const big = m(2);
    expect(measurementMin(small, big)).toBe(small);
    expect(measurementMax(small, big)).toBe(big);
  });

  it('rejects min/max when units differ', () => {
    const px = m(1, 'px');
    const em = m(2, 'em');

    expect(() => measurementMin(px, em)).toThrow(
      'measurementMin: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
    expect(() => measurementMax(px, em)).toThrow(
      'measurementMax: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
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
      'ctx: css-calipers.makeUnitAssert: Expected unit "px".',
    );
    expect(() => assertPx(m(1, 'em'))).toThrow(
      'css-calipers.makeUnitAssert: Expected unit "px".',
    );

    expect(() => assertPx(m(2))).not.toThrow();
  });

  it('identifies Measurement instances via isMeasurement', () => {
    expect(isMeasurement(m(1))).toBe(true);
    expect(isMeasurement({ css: () => 'fake' })).toBe(false);
  });

  it('rejects division by zero', () => {
    const measurement = m(10);
    expect(() => measurement.divide(0)).toThrow(
      'css-calipers.Measurement.divide: Cannot divide 10px by zero',
    );
  });

  it('rejects non-finite division results', () => {
    const measurement = m(Number.POSITIVE_INFINITY, 'px');
    expect(() => measurement.divide(2)).toThrow(
      'css-calipers.Measurement.divide: Non-finite result',
    );
  });

  it('asserts unit via Measurement.assertUnit with structured errors', () => {
    const measurement = m(1, 'px');
    expect(() => measurement.assertUnit('em')).toThrow(
      'css-calipers.Measurement.assertUnit: Expected unit "em", received "px".',
    );
    expect(() =>
      measurement.assertUnit('em', 'ctx'),
    ).toThrow(
      'ctx: css-calipers.Measurement.assertUnit: Expected unit "em", received "px".',
    );
  });

  it('asserts unit via free assertUnit, delegating to Measurement.assertUnit', () => {
    const measurement = m(1, 'px');
    expect(() => assertUnit(measurement, 'em')).toThrow(
      'css-calipers.Measurement.assertUnit: Expected unit "em", received "px".',
    );
    expect(() =>
      assertUnit(measurement, 'em', 'ctx'),
    ).toThrow(
      'ctx: css-calipers.Measurement.assertUnit: Expected unit "em", received "px".',
    );
  });

  it('asserts arbitrary conditions via assertCondition', () => {
    expect(() => assertCondition(false, 'fail')).toThrow(
      'css-calipers.assertCondition: fail',
    );
    expect(() =>
      assertCondition(() => false, 'thunk fail'),
    ).toThrow('css-calipers.assertCondition: thunk fail');
    expect(() => assertCondition(true, 'ok')).not.toThrow();
    expect(() =>
      assertCondition(() => true, 'ok'),
    ).not.toThrow();
  });

  it('compares equality with strict unit checking', () => {
    const px = m(10, 'px');
    const pxSame = m(10, 'px');
    const em = m(10, 'em');

    expect(px.equals(pxSame)).toBe(true);
    expect(px.equals(em, false)).toBe(false);
    expect(() => px.equals(em, true)).toThrow(
      'equals(strict): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
  });

  it('compares ordering with strict unit checking', () => {
    const px = m(10, 'px');
    const pxSmaller = m(5, 'px');
    const em = m(10, 'em');

    expect(px.compare(pxSmaller)).toBe(1);
    expect(pxSmaller.compare(px)).toBe(-1);
    expect(px.compare(px, true)).toBe(0);

    expect(px.compare(em, false)).not.toBe(0);
    expect(() => px.compare(em, true)).toThrow(
      'compare(strict): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em',
    );
  });

  it('asserts arbitrary predicates via Measurement.assert', () => {
    const measurement = m(2, 'px');
    expect(() =>
      measurement.assert((m) => m.getValue() > 10, 'too small'),
    ).toThrow('css-calipers.Measurement.assert: too small');
    expect(() =>
      measurement.assert((m) => m.getValue() > 1, 'should not throw'),
    ).not.toThrow();
  });
});
