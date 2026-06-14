import type {
  IMeasurement,
  InscribedMeasurement,
  UnitAssertion,
  UnitGuard,
  UnitHelper,
} from '../core';
import {
  UNIT_DEFINITIONS,
  type UnitDefinitionRecord,
  type UnitHelperName,
} from '../unitDefinitions';
import { buildMeasurementCreationError } from './buildMeasurementCreationError';
import { createErrorHelpers, type ErrorConfigStore } from './errors';

type DeltaInput = number | IMeasurement<string>;
type MeasurementCreateOptions<Unit extends string> = {
  unit?: Unit;
  context?: string;
};

// JS stringifies numbers in exponential form once the magnitude is >= 1e21 or
// < 1e-6 (e.g. "1e+21", "1e-7"). CSS output must never contain that, so we
// expand the exponent into a plain decimal by shifting the decimal point on the
// digit string. This is string manipulation on the same digits, so it does not
// re-introduce floating-point error.
const toPlainDecimal = (value: number): string => {
  const text = `${value}`;
  if (!text.includes('e') && !text.includes('E')) {
    return text;
  }
  const [
    mantissa,
    exponentText,
  ] = text.toLowerCase().split('e');
  const exponent = Number(exponentText);
  const negative = mantissa.startsWith('-');
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [
    intDigits,
    fracDigits = '',
  ] = unsigned.split('.');
  const digits = intDigits + fracDigits;
  const pointFromLeft = intDigits.length + exponent;
  const sign = negative ? '-' : '';

  if (pointFromLeft <= 0) {
    return `${sign}0.${'0'.repeat(-pointFromLeft)}${digits}`;
  }
  if (pointFromLeft >= digits.length) {
    return `${sign}${digits}${'0'.repeat(pointFromLeft - digits.length)}`;
  }
  return `${sign}${digits.slice(0, pointFromLeft)}.${digits.slice(pointFromLeft)}`;
};

export const createCoreApi = (errorStore: ErrorConfigStore) => {
  const { throwHelperError, throwMeasurementMethodError } =
    createErrorHelpers(errorStore);

  const assertMatchingUnits = <Unit extends string>(
    left: IMeasurement<Unit>,
    right: IMeasurement<Unit>,
    context: string,
  ): void => {
    const leftUnit = left.getUnit();
    const rightUnit = right.getUnit();
    if (leftUnit !== rightUnit) {
      throwHelperError({
        operation: 'css-calipers.assertMatchingUnits',
        params: [
          left,
          right,
        ],
        message: `measurement unit mismatch: ${leftUnit} vs ${rightUnit}`,
        context,
        details: { code: 'CALIPERS_E_UNIT_MISMATCH' },
      });
    }
  };

  const deltaToNumber = (
    base: IMeasurement<string>,
    delta: DeltaInput,
  ): number => {
    if (typeof delta === 'number') return delta;
    assertMatchingUnits(base, delta, 'deltaToNumber');
    return delta.getValue();
  };

  class Measurement<
    Unit extends string,
  > implements IMeasurement<Unit> {
    #value: number;
    #unit: Unit;

    constructor(value: number, unit: Unit) {
      if (!Number.isFinite(value)) {
        throwHelperError({
          operation: 'css-calipers.Measurement.constructor',
          params: [],
          message: `Non-finite measurement value: ${value}`,
          details: { code: 'CALIPERS_E_NONFINITE' },
        });
      }
      this.#value = value;
      this.#unit = unit.toLowerCase() as Unit;
    }

    css(): string {
      return `${toPlainDecimal(this.#value)}${this.#unit}`;
    }

    toString(): string {
      return this.css();
    }

    getUnit(): Unit {
      return this.#unit;
    }

    getValue(): number {
      return this.#value;
    }

    valueOf(): number {
      return this.#value;
    }

    [Symbol.toPrimitive](hint: string): string | number {
      if (hint === 'number') return this.#value;
      return this.css();
    }

    isUnit(expected: string): boolean {
      return this.#unit === expected.toLowerCase();
    }

    assertUnit(expected: string, context?: string): void {
      if (!this.isUnit(expected)) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.assertUnit',
          caller: this,
          params: [],
          message: `Expected unit "${expected}", received "${this.#unit}".`,
          context,
          details: { code: 'CALIPERS_E_ASSERT_UNIT' },
        });
      }
    }

    assert(
      predicate: (measurement: IMeasurement<Unit>) => boolean,
      message: string,
    ): void {
      if (!predicate(this)) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.assert',
          caller: this,
          params: [],
          message,
          details: { code: 'CALIPERS_E_ASSERT_PREDICATE' },
        });
      }
    }

    equals(other: IMeasurement<string>, strict = true): boolean {
      const otherUnit = other.getUnit();
      if (this.#unit !== otherUnit) {
        if (strict) {
          assertMatchingUnits(
            this,
            other as IMeasurement<Unit>,
            'equals(strict)',
          );
        }
        return false;
      }
      return this.#value === other.getValue();
    }

    compare(other: IMeasurement<string>, strict = true): number {
      if (strict) {
        assertMatchingUnits(
          this,
          other as IMeasurement<Unit>,
          'compare(strict)',
        );
      } else if (this.#unit !== other.getUnit()) {
        return this.#unit < other.getUnit() ? -1 : 1;
      }
      const diff = this.#value - other.getValue();
      if (diff === 0) return 0;
      return diff < 0 ? -1 : 1;
    }

    add(delta: number | IMeasurement<Unit>): Measurement<Unit> {
      const next = this.#value + deltaToNumber(this, delta);
      return this.#clone(next);
    }

    subtract(delta: number | IMeasurement<Unit>): Measurement<Unit> {
      const next = this.#value - deltaToNumber(this, delta);
      return this.#clone(next);
    }

    multiply(factor: number): Measurement<Unit> {
      if (factor === 1) return this;
      if (factor === 0) return new Measurement(0, this.#unit);
      if (factor === -1)
        return new Measurement(-this.#value, this.#unit);
      return this.#clone(this.#value * factor);
    }

    divide(divisor: number): Measurement<Unit> {
      if (divisor === 1) return this;
      if (divisor === 0) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.divide',
          caller: this,
          params: [],
          message: `Cannot divide ${this.css()} by zero`,
          details: { code: 'CALIPERS_E_DIVIDE_BY_ZERO' },
        });
      }
      const result = this.#value / divisor;
      if (!Number.isFinite(result)) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.divide',
          caller: this,
          params: [],
          message: 'Non-finite result',
          details: { code: 'CALIPERS_E_NONFINITE_RESULT' },
        });
      }
      return this.#clone(result);
    }

    double(): Measurement<Unit> {
      return this.#clone(this.#value * 2);
    }

    half(): Measurement<Unit> {
      return this.#clone(this.#value / 2);
    }

    negation(shouldNegate = true): Measurement<Unit> {
      return shouldNegate ? this.#clone(-this.#value) : this;
    }

    absolute(): Measurement<Unit> {
      return this.#clone(Math.abs(this.#value));
    }

    round(precision = 0): Measurement<Unit> {
      const next =
        precision === 0
          ? Math.round(this.#value)
          : Number(this.#value.toFixed(precision));
      return this.#clone(next);
    }

    floor(): Measurement<Unit> {
      return this.#clone(Math.floor(this.#value));
    }

    ceil(): Measurement<Unit> {
      return this.#clone(Math.ceil(this.#value));
    }

    clamp(
      min: IMeasurement<Unit>,
      max: IMeasurement<Unit>,
    ): Measurement<Unit> {
      assertMatchingUnits(this, min, 'clamp(min)');
      assertMatchingUnits(this, max, 'clamp(max)');

      const minValue = min.getValue();
      const maxValue = max.getValue();

      if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.clamp',
          caller: this,
          params: [
            min,
            max,
          ],
          message: 'clamp: expected finite bounds',
          details: { code: 'CALIPERS_E_CLAMP_NONFINITE_BOUNDS' },
        });
      }
      if (minValue > maxValue) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.clamp',
          caller: this,
          params: [
            min,
            max,
          ],
          message: `clamp: min (${min.css()}) must be <= max (${max.css()})`,
          details: { code: 'CALIPERS_E_CLAMP_INVALID_RANGE' },
        });
      }

      const clamped = Math.min(
        maxValue,
        Math.max(minValue, this.#value),
      );
      return this.#clone(clamped);
    }

    #clone(value: number): Measurement<Unit> {
      return new Measurement(value, this.#unit);
    }
  }

  // Single controlled point where the unit brand is asserted onto a freshly
  // created measurement (the brand is a compile-time-only phantom).
  const createMeasurement = <Unit extends string>(
    value: number,
    unit: Unit,
  ): InscribedMeasurement<Unit> =>
    new Measurement(
      value,
      unit,
    ) as unknown as InscribedMeasurement<Unit>;

  const isMeasurement = (x: unknown): x is IMeasurement<string> =>
    x instanceof Measurement;

  function m(value: number): InscribedMeasurement<'px'>;
  function m(
    value: number,
    options: { context?: string },
  ): InscribedMeasurement<'px'>;
  function m<Unit extends string>(
    value: number,
    unit: Unit,
    context?: string,
  ): InscribedMeasurement<Lowercase<Unit>>;
  function m<Unit extends string>(
    value: number,
    options: MeasurementCreateOptions<Unit>,
  ): InscribedMeasurement<Lowercase<Unit>>;
  function m<Unit extends string>(
    value: number,
    unitOrOptions:
      | Unit
      | MeasurementCreateOptions<Unit> = 'px' as Unit,
    context?: string,
  ): InscribedMeasurement<Lowercase<Unit>> {
    const options =
      unitOrOptions && typeof unitOrOptions === 'object'
        ? unitOrOptions
        : { unit: unitOrOptions, context };
    const unit = (options.unit ?? 'px') as Unit;
    const contextLabel = options.context;
    const normalizedUnit = unit.toLowerCase() as Lowercase<Unit>;
    if (!Number.isFinite(value)) {
      const errorPayload = buildMeasurementCreationError(
        value,
        normalizedUnit,
        'm',
        contextLabel,
      );
      throwHelperError({
        operation: 'css-calipers.m',
        params: [],
        message: errorPayload.message,
        context: errorPayload.context,
        details: errorPayload.details,
        includeStackHint: true,
      });
    }
    return createMeasurement(value, normalizedUnit);
  }

  type UnitHelperFactory<Unit extends string> = ((
    value: number,
    context?: string,
  ) => InscribedMeasurement<Unit>) & {
    unit: Unit;
  };

  const createUnitHelper = <Unit extends string>(
    unit: Unit,
    helperName?: string,
  ): UnitHelperFactory<Unit> => {
    const normalizedUnit = unit.toLowerCase() as Unit;
    const helperLabel =
      helperName ?? `makeUnitHelper(${normalizedUnit})`;
    const factory = (value: number, context?: string) => {
      if (!Number.isFinite(value)) {
        const errorPayload = buildMeasurementCreationError(
          value,
          normalizedUnit,
          helperLabel,
          context,
        );
        throwHelperError({
          operation: `css-calipers.${helperLabel}`,
          params: [],
          message: errorPayload.message,
          context: errorPayload.context,
          details: errorPayload.details,
          includeStackHint: true,
        });
      }
      return createMeasurement(value, normalizedUnit);
    };
    return Object.assign(factory, {
      unit: normalizedUnit,
    });
  };

  const makeUnitHelper = <Unit extends string>(
    unit: Unit,
  ): UnitHelper<Unit> => {
    return createUnitHelper(unit);
  };

  const makeUnitHelperFromDefinition = <Name extends UnitHelperName>(
    name: Name,
  ): UnitHelper<UnitDefinitionRecord[Name]['unit']> =>
    createUnitHelper(UNIT_DEFINITIONS[name].unit, name);

  const measurementUnitMetadata = UNIT_DEFINITIONS;
  type MeasurementOfHelper<T extends UnitHelper> = ReturnType<T>;

  const makeUnitGuard = <T extends UnitHelper>(
    helper: T,
  ): UnitGuard<T> => {
    return (value: unknown): value is MeasurementOfHelper<T> =>
      isMeasurement(value) && value.isUnit(helper.unit);
  };

  const makeUnitAssert = <T extends UnitHelper>(
    helper: T,
  ): UnitAssertion<T> => {
    const guard = makeUnitGuard(helper);
    return (
      value: unknown,
      context?: string,
    ): asserts value is MeasurementOfHelper<T> => {
      if (!guard(value)) {
        throwHelperError({
          operation: 'css-calipers.makeUnitAssert',
          params: isMeasurement(value)
            ? [
                value,
              ]
            : [],
          message: `Expected unit "${helper.unit}".`,
          context,
          details: { code: 'CALIPERS_E_ASSERT_UNIT' },
        });
      }
    };
  };

  const hasCssMethod = (x: unknown): x is { css: () => string } => {
    return (
      typeof x === 'object' &&
      x !== null &&
      'css' in x &&
      typeof x.css === 'function'
    );
  };

  const measurementMin = <Unit extends string>(
    a: IMeasurement<Unit>,
    b: IMeasurement<NoInfer<Unit>>,
  ): IMeasurement<Unit> => {
    assertMatchingUnits(a, b, 'measurementMin');
    return a.getValue() <= b.getValue() ? a : b;
  };

  const measurementMax = <Unit extends string>(
    a: IMeasurement<Unit>,
    b: IMeasurement<NoInfer<Unit>>,
  ): IMeasurement<Unit> => {
    assertMatchingUnits(a, b, 'measurementMax');
    return a.getValue() >= b.getValue() ? a : b;
  };

  const assertUnit = <Unit extends string>(
    measurement: IMeasurement<Unit>,
    expectedUnit: string,
    context?: string,
  ) => measurement.assertUnit(expectedUnit, context);

  const assertCondition = (
    condition: boolean | (() => boolean),
    message: string,
  ): void => {
    const passed =
      typeof condition === 'function' ? condition() : condition;
    if (!passed) {
      throwHelperError({
        operation: 'css-calipers.assertCondition',
        params: [],
        message,
        details: { code: 'CALIPERS_E_ASSERT_CONDITION' },
      });
    }
  };

  return {
    m,
    isMeasurement,
    assertMatchingUnits,
    measurementMin,
    measurementMax,
    measurementUnitMetadata,
    makeUnitHelper,
    makeUnitHelperFromDefinition,
    makeUnitGuard,
    makeUnitAssert,
    hasCssMethod,
    assertUnit,
    assertCondition,
    getErrorConfig: errorStore.getErrorConfig,
    setErrorConfig: errorStore.setErrorConfig,
  } as const;
};

export type CoreApi = ReturnType<typeof createCoreApi>;
