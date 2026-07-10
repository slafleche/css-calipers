import { describe, expect, it } from 'vitest';

export interface MeasurementLike {
  css: () => string;
  toString: () => string;
  getUnit: () => string;
  getValue: () => number;
  valueOf: () => number;
  equals: (other: MeasurementLike, strict?: boolean) => boolean;
  compare: (other: MeasurementLike, strict?: boolean) => number;
  add: (delta: number | MeasurementLike) => MeasurementLike;
  subtract: (delta: number | MeasurementLike) => MeasurementLike;
  multiply: (factor: number) => MeasurementLike;
  divide: (divisor: number) => MeasurementLike;
  double: () => MeasurementLike;
  half: () => MeasurementLike;
  negation: (shouldNegate?: boolean) => MeasurementLike;
  absolute: () => MeasurementLike;
  round: (precision?: number) => MeasurementLike;
  floor: () => MeasurementLike;
  ceil: () => MeasurementLike;
  clamp: (
    min: MeasurementLike,
    max: MeasurementLike,
  ) => MeasurementLike;
  assertUnit: (expected: string, context?: string) => void;
  assert: (
    predicate: (measurement: MeasurementLike) => boolean,
    message: string,
  ) => void;
}

export type UnitHelperLike = ((
  value: number,
  context?: string,
) => MeasurementLike) & {
  unit: string;
};

export interface CoreApi {
  m: (
    value: number,
    unitOrOptions?: string | { unit?: string; context?: string },
    context?: string,
  ) => MeasurementLike;
  setErrorConfig: (next: {
    stackHints?: 'auto' | 'on' | 'off';
  }) => void;
  getErrorConfig: () => { stackHints: 'auto' | 'on' | 'off' };
  mPercent: UnitHelperLike;
  mPx: UnitHelperLike;
  mCm: UnitHelperLike;
  mEm: UnitHelperLike;
  mVh: UnitHelperLike;
  mSvw: UnitHelperLike;
  mLvw: UnitHelperLike;
  mDvw: UnitHelperLike;
  mCqh: UnitHelperLike;
  mDeg: UnitHelperLike;
  mMs: UnitHelperLike;
  mKhz: UnitHelperLike;
  mDpi: UnitHelperLike;
  mFr: UnitHelperLike;
  mCqw: UnitHelperLike;
  assertMatchingUnits: (
    left: MeasurementLike,
    right: MeasurementLike,
    context: string,
  ) => void;
  assertUnit: (
    measurement: MeasurementLike,
    expectedUnit: string,
    context?: string,
  ) => void;
  assertCondition: (
    condition: boolean | (() => boolean),
    message: string,
  ) => void;
  isMeasurement: (value: unknown) => value is MeasurementLike;
  isPercentMeasurement: (value: unknown) => boolean;
  assertPercentMeasurement: (
    value: unknown,
    context?: string,
  ) => void;
  makeUnitHelper: (unit: string) => UnitHelperLike;
  makeUnitHelperFromDefinition: (name: string) => UnitHelperLike;
  measurementUnitMetadata: Record<
    string,
    { unit: string; category: string }
  >;
  makeUnitAssert: (
    helper: UnitHelperLike,
  ) => (value: unknown, context?: string) => void;
  makeUnitGuard: (
    helper: UnitHelperLike,
  ) => (value: unknown) => boolean;
  hasCssMethod: (value: unknown) => value is { css: () => string };
  measurementMin: (
    a: MeasurementLike,
    b: MeasurementLike,
  ) => MeasurementLike;
  measurementMax: (
    a: MeasurementLike,
    b: MeasurementLike,
  ) => MeasurementLike;
}

export const runCoreTests = (label: string, api: CoreApi): void => {
  const captureErrorMessage = (fn: () => void): string => {
    try {
      fn();
    } catch (error) {
      return (error as Error).message;
    }
    return '';
  };

  const {
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
    assertMatchingUnits,
    assertUnit,
    assertCondition,
    isMeasurement,
    isPercentMeasurement,
    assertPercentMeasurement,
    makeUnitHelper,
    makeUnitHelperFromDefinition,
    measurementUnitMetadata,
    makeUnitAssert,
    makeUnitGuard,
    hasCssMethod,
    measurementMin,
    measurementMax,
    setErrorConfig,
    getErrorConfig,
  } = api;

  describe(`CSS-Calipers core helpers (${label})`, () => {
    it('creates lowercase units and exposes css/value helpers', () => {
      const measurement = m(12.5, 'PX');
      expect(measurement.css()).toBe('12.5px');
      expect(measurement.getUnit()).toBe('px');
      expect(measurement.getValue()).toBe(12.5);
      expect(measurement.toString()).toBe('12.5px');
    });

    it('defaults shorthand measurements to px', () => {
      const measurement = m(10);
      expect(measurement.getUnit()).toBe('px');
      expect(measurement.css()).toBe('10px');
    });

    it('rejects non-finite values at construction time', () => {
      const previousStackHints = getErrorConfig().stackHints;
      setErrorConfig({ stackHints: 'on' });
      try {
        const missingValueMessage = captureErrorMessage(() =>
          (m as (value?: number) => MeasurementLike)(),
        );
        expect(missingValueMessage).toContain(
          'css-calipers.m: Non-finite measurement value: undefined',
        );
        expect(missingValueMessage).toContain(
          'code=CALIPERS_E_NONFINITE',
        );
        expect(missingValueMessage).toContain('helper=m');
        expect(missingValueMessage).toContain(
          'inputs=value=undefined, unit=px',
        );
        expect(missingValueMessage).toContain('stack=');

        expect(() => m(Number.NaN, 'px')).toThrow(
          /css-calipers\.m: Non-finite measurement value: NaN/,
        );
        expect(() => m(Number.NaN, 'px')).toThrow(
          /code=CALIPERS_E_NONFINITE/,
        );
        expect(() => m(Number.NaN, 'px')).toThrow(/helper=m/);
        expect(() => m(Number.NaN, 'px')).toThrow(
          /inputs=value=NaN, unit=px/,
        );
        expect(() => m(Number.NaN, 'px')).toThrow(/stack=/);

        const contextMessage = captureErrorMessage(() =>
          m(Number.NaN, { context: 'tokens.cardWidth' }),
        );
        expect(contextMessage).toContain(
          'tokens.cardWidth: css-calipers.m: Non-finite measurement value: NaN',
        );
      } finally {
        setErrorConfig({ stackHints: previousStackHints });
      }

      setErrorConfig({ stackHints: 'off' });
      try {
        const message = captureErrorMessage(() =>
          m(Number.POSITIVE_INFINITY, 'px'),
        );
        expect(message).toContain(
          'css-calipers.m: Non-finite measurement value: Infinity',
        );
        expect(message).not.toContain('stack=');
      } finally {
        setErrorConfig({ stackHints: previousStackHints });
      }

      const helperMessage = captureErrorMessage(() =>
        mPx(Number.NEGATIVE_INFINITY),
      );
      expect(helperMessage).toContain(
        'css-calipers.mPx: Non-finite measurement value: -Infinity',
      );
      expect(helperMessage).toContain('code=CALIPERS_E_NONFINITE');
      expect(helperMessage).toContain('helper=mPx');
      expect(helperMessage).toContain(
        'inputs=value=-Infinity, unit=px',
      );
      expect(helperMessage).toContain('stack=');

      const helperContextMessage = captureErrorMessage(() =>
        mPx(Number.NaN, 'tokens.spacing'),
      );
      expect(helperContextMessage).toContain(
        'tokens.spacing: css-calipers.mPx: Non-finite measurement value: NaN',
      );
    });

    it('emits plain decimal css, never scientific notation', () => {
      // normal values are unchanged
      expect(m(10).css()).toBe('10px');
      expect(m(3.14).css()).toBe('3.14px');
      expect(m(1).multiply(100000000000000000).css()).toBe(
        '100000000000000000px',
      );
      // magnitudes that JS would stringify in exponential form
      expect(m(1).multiply(1e21).css()).toBe(
        '1000000000000000000000px',
      );
      expect(m(1).divide(1e7).css()).toBe('0.0000001px');
      expect(m(1.5).divide(1e7).css()).toBe('0.00000015px');
      expect(m(-1).divide(1e7).css()).toBe('-0.0000001px');
      expect(m(1.23).multiply(1e21).css()).toBe(
        '1230000000000000000000px',
      );

      // zero and normal decimals must be untouched (no rounding, no exponent)
      expect(m(0).css()).toBe('0px');
      expect(m(1).multiply(0).css()).toBe('0px');
      expect(m(0.1).css()).toBe('0.1px');
      expect(m(123.456).css()).toBe('123.456px');
      expect(m(3.14159).css()).toBe('3.14159px');

      // extremely small magnitudes still expand to faithful plain decimal
      const tiny = m(1).divide(1e300).css();
      expect(tiny.endsWith('px')).toBe(true);
      expect(tiny).not.toMatch(/e/i);
      expect(Number(tiny.slice(0, -2))).toBe(1e-300);
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
        'deltaToNumber: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
      expect(() => assertMatchingUnits(px, em, 'test')).toThrow(
        'test: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
      expect(() => assertMatchingUnits(px, em, '')).toThrow(
        'css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
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

      // divide by 1 short-circuits to the same instance (the identity branch).
      expect(base.divide(1)).toBe(base);

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
        'css-calipers.Measurement.clamp: clamp: min (20px) must be <= max (12px) [code=CALIPERS_E_CLAMP_INVALID_RANGE]',
      );
    });

    it('rejects clamp when min or max units differ', () => {
      const value = m(10, 'px');
      const em = m(1, 'em');

      expect(() => value.clamp(em, m(12, 'px'))).toThrow(
        'clamp(min): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
      expect(() => value.clamp(m(8, 'px'), em)).toThrow(
        'clamp(max): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
    });

    it('computes min and max for matching units', () => {
      const small = m(1);
      const big = m(2);
      expect(measurementMin(small, big)).toBe(small);
      expect(measurementMax(small, big)).toBe(big);
      // the reversed-argument order exercises the OTHER ternary branch:
      // min returns the second arg, max returns the second arg.
      expect(measurementMin(big, small)).toBe(small);
      expect(measurementMax(big, small)).toBe(big);
      // equal values: min/max both fall to the documented tie side.
      const tieA = m(3);
      const tieB = m(3);
      expect(measurementMin(tieA, tieB)).toBe(tieA);
      expect(measurementMax(tieA, tieB)).toBe(tieA);
    });

    it('rejects min/max when units differ', () => {
      const px = m(1, 'px');
      const em = m(2, 'em');

      expect(() => measurementMin(px, em)).toThrow(
        'measurementMin: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
      expect(() => measurementMax(px, em)).toThrow(
        'measurementMax: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
    });

    describe('unit-safety matrix', () => {
      const mismatchedPairs = [
        { l: 'px', r: 'em', left: mPx, right: mEm },
        { l: 'em', r: 'px', left: mEm, right: mPx },
        { l: 'px', r: '%', left: mPx, right: mPercent },
        { l: '%', r: 'deg', left: mPercent, right: mDeg },
        { l: 'deg', r: 'ms', left: mDeg, right: mMs },
        { l: 'ms', r: 'khz', left: mMs, right: mKhz },
        { l: 'dpi', r: 'deg', left: mDpi, right: mDeg },
        { l: 'fr', r: 'px', left: mFr, right: mPx },
        { l: 'vh', r: 'cqw', left: mVh, right: mCqw },
        { l: 'cqw', r: 'px', left: mCqw, right: mPx },
      ];

      it.each(mismatchedPairs)(
        'rejects every coupled operation for $l vs $r',
        ({ left, right }) => {
          const a = left(10);
          const b = right(5);

          expect(() => a.add(b)).toThrow(/CALIPERS_E_UNIT_MISMATCH/);
          expect(() => a.subtract(b)).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
          expect(() => a.clamp(b, left(20))).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
          expect(() => a.clamp(left(1), b)).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
          expect(() => measurementMin(a, b)).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
          expect(() => measurementMax(a, b)).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
          expect(() => assertMatchingUnits(a, b, 'matrix')).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
        },
      );

      it.each(mismatchedPairs)(
        'equals/compare throw for $l vs $r by default but allow strict=false',
        ({ left, right }) => {
          const a = left(10);
          const b = right(10);

          expect(() => a.equals(b)).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );
          expect(() => a.compare(b)).toThrow(
            /CALIPERS_E_UNIT_MISMATCH/,
          );

          expect(a.equals(b, false)).toBe(false);
          expect(typeof a.compare(b, false)).toBe('number');
        },
      );

      const unitPreserving = [
        { unit: 'px', make: mPx },
        { unit: 'em', make: mEm },
        { unit: '%', make: mPercent },
        { unit: 'deg', make: mDeg },
        { unit: 'ms', make: mMs },
        { unit: 'vh', make: mVh },
        { unit: 'fr', make: mFr },
        { unit: 'dpi', make: mDpi },
      ];

      it.each(unitPreserving)(
        'keeps the $unit unit through arithmetic and range operations',
        ({ unit, make }) => {
          expect(make(8).add(make(2)).css()).toBe(`10${unit}`);
          expect(make(8).subtract(make(2)).getValue()).toBe(6);
          expect(make(8).multiply(2).getUnit()).toBe(unit);
          expect(make(8).divide(2).getUnit()).toBe(unit);
          expect(make(8).double().getUnit()).toBe(unit);
          expect(make(8).half().getUnit()).toBe(unit);
          expect(make(8).negation().getUnit()).toBe(unit);
          expect(make(-8).absolute().getUnit()).toBe(unit);
          expect(make(8.4).round().getUnit()).toBe(unit);
          expect(make(8.4).floor().getUnit()).toBe(unit);
          expect(make(8.4).ceil().getUnit()).toBe(unit);

          const lo = make(1);
          const hi = make(5);
          expect(measurementMin(lo, hi)).toBe(lo);
          expect(measurementMax(lo, hi)).toBe(hi);
          expect(make(10).clamp(lo, hi).getValue()).toBe(5);
          expect(make(3).clamp(lo, hi).getValue()).toBe(3);
        },
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
      expect(() => assertPercentMeasurement(mPx(1), 'ctx')).toThrow(
        'ctx: css-calipers.makeUnitAssert: Expected unit "%". [code=CALIPERS_E_ASSERT_UNIT]',
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
        'ctx: css-calipers.makeUnitAssert: Expected unit "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );
      expect(() => assertPx(m(1, 'em'))).toThrow(
        'css-calipers.makeUnitAssert: Expected unit "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );

      expect(() => assertPx(m(2))).not.toThrow();

      // a NON-measurement value still fails the assertion; this exercises the
      // empty-params branch of makeUnitAssert (no measurement to attach).
      expect(() => assertPx(42)).toThrow(
        'css-calipers.makeUnitAssert: Expected unit "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );
      expect(() => assertPx(null)).toThrow(/Expected unit "px"/);
    });

    it('covers guard and util helpers on non-measurement values', () => {
      const guard = makeUnitGuard(mPx);

      expect(guard(null)).toBe(false);
      expect(guard(42)).toBe(false);
      expect(guard({})).toBe(false);

      expect(hasCssMethod({ css: () => 'ok' })).toBe(true);
      expect(hasCssMethod({ css: 'not-a-function' })).toBe(false);
      expect(hasCssMethod(null)).toBe(false);
      expect(hasCssMethod(123)).toBe(false);
      expect(hasCssMethod({})).toBe(false);
    });

    it('identifies Measurement instances via isMeasurement', () => {
      expect(isMeasurement(m(1))).toBe(true);
      expect(isMeasurement({ css: () => 'fake' })).toBe(false);
    });

    it('rejects division by zero', () => {
      const measurement = m(10);
      expect(() => measurement.divide(0)).toThrow(
        'css-calipers.Measurement.divide: Cannot divide 10px by zero [code=CALIPERS_E_DIVIDE_BY_ZERO]',
      );
    });

    it('asserts unit via Measurement.assertUnit with structured errors', () => {
      const measurement = m(1, 'px');
      expect(() => measurement.assertUnit('em')).toThrow(
        'css-calipers.Measurement.assertUnit: Expected unit "em", received "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );
      expect(() => measurement.assertUnit('em', 'ctx')).toThrow(
        'ctx: css-calipers.Measurement.assertUnit: Expected unit "em", received "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );
    });

    it('asserts unit via free assertUnit, delegating to Measurement.assertUnit', () => {
      const measurement = m(1, 'px');
      expect(() => assertUnit(measurement, 'em')).toThrow(
        'css-calipers.Measurement.assertUnit: Expected unit "em", received "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );
      expect(() => assertUnit(measurement, 'em', 'ctx')).toThrow(
        'ctx: css-calipers.Measurement.assertUnit: Expected unit "em", received "px". [code=CALIPERS_E_ASSERT_UNIT]',
      );
    });

    it('asserts arbitrary conditions via assertCondition', () => {
      expect(() => assertCondition(false, 'fail')).toThrow(
        'css-calipers.assertCondition: fail [code=CALIPERS_E_ASSERT_CONDITION]',
      );
      expect(() =>
        assertCondition(() => false, 'thunk fail'),
      ).toThrow(
        'css-calipers.assertCondition: thunk fail [code=CALIPERS_E_ASSERT_CONDITION]',
      );
      expect(() => assertCondition(true, 'ok')).not.toThrow();
      expect(() => assertCondition(() => true, 'ok')).not.toThrow();
    });

    it('compares equality with strict unit checking', () => {
      const px = m(10, 'px');
      const pxSame = m(10, 'px');
      const em = m(10, 'em');

      expect(px.equals(pxSame)).toBe(true);
      expect(px.equals(em, false)).toBe(false);
      expect(() => px.equals(em, true)).toThrow(
        'equals(strict): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
    });

    it('compares ordering with strict unit checking', () => {
      const px = m(10, 'px');
      const pxSmaller = m(5, 'px');
      const em = m(10, 'em');

      expect(px.compare(pxSmaller)).toBe(1);
      expect(pxSmaller.compare(px)).toBe(-1);
      expect(px.compare(px, true)).toBe(0);

      // non-strict compare on MATCHING units skips the unit-ordering branch and
      // compares by value (the false side of the unit-mismatch guard).
      expect(px.compare(pxSmaller, false)).toBe(1);
      expect(pxSmaller.compare(px, false)).toBe(-1);
      expect(px.compare(m(10, 'px'), false)).toBe(0);

      expect(px.compare(em, false)).not.toBe(0);
      // non-strict compare on mismatched units orders by the unit string itself.
      // 'em' < 'px' -> -1 (the lower-than branch); 'px' > 'em' -> 1 (the other).
      expect(em.compare(px, false)).toBe(-1);
      expect(px.compare(em, false)).toBe(1);
      expect(() => px.compare(em, true)).toThrow(
        'compare(strict): css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
    });

    it('asserts arbitrary predicates via Measurement.assert', () => {
      const measurement = m(2, 'px');
      expect(() =>
        measurement.assert((mm) => mm.getValue() > 10, 'too small'),
      ).toThrow(
        'css-calipers.Measurement.assert: too small [code=CALIPERS_E_ASSERT_PREDICATE]',
      );
      expect(() =>
        measurement.assert(
          (mm) => mm.getValue() > 1,
          'should not throw',
        ),
      ).not.toThrow();
    });

    it('composes a simple layout flow with measurements', () => {
      const spacing = m(8); // 8px
      const cardPadding = spacing.multiply(2); // 16px
      const gutter = spacing; // 8px

      const minWidth = m(200, 'px');
      const maxWidth = m(400, 'px');
      const contentWidth = m(350, 'px');

      const clampedWidth = contentWidth.clamp(minWidth, maxWidth); // remains 350px
      expect(clampedWidth.css()).toBe('350px');

      const totalInline = clampedWidth
        .add(cardPadding.multiply(2)) // left + right padding
        .add(gutter); // gap to next card

      expect(totalInline.css()).toBe('390px');

      const layoutStyles = {
        cardWidth: clampedWidth.css(),
        cardPaddingInline: cardPadding.css(),
        cardGap: gutter.css(),
      };

      expect(layoutStyles).toEqual({
        cardWidth: '350px',
        cardPaddingInline: '16px',
        cardGap: '8px',
      });
    });

    it('enforces a domain invariant using asserts', () => {
      const paddingBlock = m(12, 'px');
      const paddingInline = m(16, 'px');

      // Happy path invariant: same unit and positive values
      expect(() =>
        assertMatchingUnits(
          paddingBlock,
          paddingInline,
          'Button padding mismatch',
        ),
      ).not.toThrow();
      expect(() =>
        assertUnit(paddingBlock, 'px', 'Button padding block'),
      ).not.toThrow();
      expect(() =>
        assertUnit(paddingInline, 'px', 'Button padding inline'),
      ).not.toThrow();
      expect(() =>
        assertCondition(
          () =>
            paddingBlock.getValue() > 0 &&
            paddingInline.getValue() > 0,
          'Button padding must be positive',
        ),
      ).not.toThrow();

      // Failure path: mismatched units and zero padding
      const badPaddingBlock = m(0, 'px');
      const badPaddingInline = m(16, 'em');

      expect(() =>
        assertMatchingUnits(
          badPaddingBlock,
          badPaddingInline,
          'Button padding mismatch',
        ),
      ).toThrow(
        'Button padding mismatch: css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]',
      );
      expect(() =>
        assertCondition(
          () => badPaddingBlock.getValue() > 0,
          'Button padding must be positive',
        ),
      ).toThrow(
        'css-calipers.assertCondition: Button padding must be positive [code=CALIPERS_E_ASSERT_CONDITION]',
      );
    });
  });
};
