import { describe, expect, it } from 'vitest';
import {
  assertMatchingUnits,
  assertUnit,
  assertCondition,
  isMeasurement,
  m,
  mPercent,
  mPx,
  mCm,
  mEm,
  mVh,
  mSvw,
  mLvw,
  mDvw,
  mCqh,
  mDeg,
  mMs,
  mKhz,
  mDpi,
  mFr,
  mCqw,
  isPercentMeasurement,
  assertPercentMeasurement,
  makeUnitHelper,
  makeUnitHelperFromDefinition,
  measurementUnitMetadata,
  makeUnitAssert,
  makeUnitGuard,
  hasCssMethod,
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
  it('rejects non-finite values at construction time', () => {
    expect(() => m(Number.NaN, 'px')).toThrow(
      'css-calipers.Measurement.constructor: Non-finite measurement value: NaN',
    );
    expect(() => m(Number.POSITIVE_INFINITY, 'px')).toThrow(
      'css-calipers.Measurement.constructor: Non-finite measurement value: Infinity',
    );
    expect(() => mPx(Number.NEGATIVE_INFINITY)).toThrow(
      'css-calipers.Measurement.constructor: Non-finite measurement value: -Infinity',
    );
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

  it('covers branches in multiply/double/half/negation and coercion', () => {
    const base = m(5, 'px');

    // multiply branches
    expect(base.multiply(1)).toBe(base);
    expect(base.multiply(0).css()).toBe('0px');
    expect(base.multiply(-1).css()).toBe('-5px');
    expect(base.multiply(3).css()).toBe('15px');

    // double / half
    expect(base.double().css()).toBe('10px');
    expect(base.half().css()).toBe('2.5px');

    // negation(false) returns the same instance
    expect(base.negation(false)).toBe(base);

    // Symbol.toPrimitive via Number() and string coercion
    const primitiveNumber = Number(base);
    expect(primitiveNumber).toBe(5);
    const primitiveString = `${base}`;
    expect(primitiveString).toBe('5px');

    // Explicit valueOf path
    expect(base.valueOf()).toBe(5);
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

  it('covers additional unit families via helpers', () => {
    const cm = mCm(1.5);
    expect(cm.css()).toBe('1.5cm');
    expect(cm.getUnit()).toBe('cm');

    const em = mEm(2);
    expect(em.css()).toBe('2em');
    expect(em.getUnit()).toBe('em');

    const vh = mVh(50);
    expect(vh.css()).toBe('50vh');
    expect(vh.getUnit()).toBe('vh');

    const svw = mSvw(10);
    expect(svw.css()).toBe('10svw');

    const lvw = mLvw(15);
    expect(lvw.css()).toBe('15lvw');

    const dvw = mDvw(20);
    expect(dvw.css()).toBe('20dvw');

    const cqh = mCqh(30);
    expect(cqh.css()).toBe('30cqh');

    const deg = mDeg(90);
    expect(deg.css()).toBe('90deg');

    const ms = mMs(200);
    expect(ms.css()).toBe('200ms');

    const khz = mKhz(2);
    expect(khz.css()).toBe('2khz');

    const dpi = mDpi(300);
    expect(dpi.css()).toBe('300dpi');

    const fr = mFr(1);
    expect(fr.css()).toBe('1fr');

    const p = mPercent(25);
    expect(isPercentMeasurement(p)).toBe(true);
    expect(isPercentMeasurement(mPx(1))).toBe(false);
    expect(() =>
      assertPercentMeasurement(mPx(1), 'ctx'),
    ).toThrow(
      'ctx: css-calipers.makeUnitAssert: Expected unit "%".',
    );
  });

  it('exercises dynamic factories and unit metadata', () => {
    const pxHelper = makeUnitHelper('px');
    const dynamicPx = pxHelper(3);
    expect(dynamicPx.css()).toBe('3px');
    expect(pxHelper.unit).toBe('px');

    const pxFromDef = makeUnitHelperFromDefinition('mPx');
    const dynamicPxFromDef = pxFromDef(4);
    expect(dynamicPxFromDef.css()).toBe('4px');
    expect(pxFromDef.unit).toBe('px');

    const metaPx = measurementUnitMetadata.mPx;
    expect(metaPx.unit).toBe('px');
    expect(metaPx.category).toBe('length-absolute');

    const metaPercent = measurementUnitMetadata.mPercent;
    expect(metaPercent.unit).toBe('%');
    expect(metaPercent.category).toBe('percent');

    const metaCqw = measurementUnitMetadata.mCqw;
    expect(metaCqw.unit).toBe('cqw');
    expect(metaCqw.category).toBe('length-container');
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

  it('covers guard and util helpers on non-measurement values', () => {
    const guard = makeUnitGuard(mPx);

    expect(guard(null)).toBe(false);
    expect(guard(42 as unknown)).toBe(false);
    expect(guard({} as unknown)).toBe(false);

    expect(hasCssMethod({ css: () => 'ok' })).toBe(true);
    expect(hasCssMethod({ css: 'not-a-function' })).toBe(false);
    expect(hasCssMethod(null)).toBe(false);
    expect(hasCssMethod(123 as unknown)).toBe(false);
    expect(hasCssMethod({})).toBe(false);
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
