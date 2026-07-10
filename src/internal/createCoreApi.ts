import type {
  GreaterOrEqualToZeroBrand,
  IMeasurement,
  InRangeBrand,
  InscribedMeasurement,
  MeasurementRefinement,
  MeasurementRefinementResult,
  NonNegativeMeasurement,
  SmallerOrEqualToZeroBrand,
  UnitAssertion,
  UnitGuard,
  UnitHelper,
} from '../core';
import { f } from '../float';
import {
  type Constraints,
  DEFAULT_HARDENING,
  describeBound,
  type Hardening,
  normalizeConstraints,
  violatesConstraints,
} from '../hardening';
import { i } from '../integer';
import { type Scalar, toNumber } from '../scalar';
import {
  UNIT_CATEGORY_BY_UNIT,
  UNIT_DEFINITIONS,
  type UnitCategory,
  type UnitDefinitionRecord,
  type UnitHelperName,
} from '../unitDefinitions';
import { buildMeasurementCreationError } from './buildMeasurementCreationError';
import { createErrorHelpers, type ErrorConfigStore } from './errors';
import { toPlainDecimal } from './toPlainDecimal';

type DeltaInput = number | IMeasurement<string>;
type MeasurementCreateOptions<Unit extends string> = {
  unit?: Unit;
  context?: string;
};

export const createCoreApi = (
  errorStore: ErrorConfigStore,
  hardening: Hardening = DEFAULT_HARDENING,
) => {
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
    #constraints: Constraints;

    constructor(
      value: number,
      unit: Unit,
      constraints: Constraints = {},
    ) {
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
      this.#constraints = constraints;
    }

    css(): string {
      return `${toPlainDecimal(this.#value)}${this.#unit}`;
    }

    toString(): string {
      return this.css();
    }

    unit(): Unit {
      return this.#unit;
    }

    value(): number {
      return this.#value;
    }

    getUnit(): Unit {
      return this.#unit;
    }

    getValue(): number {
      return this.#value;
    }

    constraints(): Constraints {
      return { ...this.#constraints };
    }

    isInt(): boolean {
      return Number.isInteger(this.#value);
    }

    isFloat(): boolean {
      return !Number.isInteger(this.#value);
    }

    toTypedValue() {
      return Number.isInteger(this.#value)
        ? i(this.#value)
        : f(this.#value);
    }

    category(): UnitCategory | undefined {
      return UNIT_CATEGORY_BY_UNIT[this.#unit];
    }

    isLength(): boolean {
      const category = this.category();
      return category !== undefined && category.startsWith('length-');
    }

    isAbsolute(): boolean {
      return this.category() === 'length-absolute';
    }

    isRelative(): boolean {
      return this.isLength() && !this.isAbsolute();
    }

    isPercent(): boolean {
      return this.category() === 'percent';
    }

    isAngle(): boolean {
      return this.category() === 'angle';
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

    multiply(factor: Scalar): Measurement<Unit> {
      const numericFactor = toNumber(factor);
      if (numericFactor === 1) return this;
      if (numericFactor === 0) return this.#clone(0);
      if (numericFactor === -1) return this.#clone(-this.#value);
      return this.#clone(this.#value * numericFactor);
    }

    divide(divisor: Scalar): Measurement<Unit> {
      const numericDivisor = toNumber(divisor);
      if (numericDivisor === 1) return this;
      if (numericDivisor === 0) {
        throwMeasurementMethodError({
          operation: 'css-calipers.Measurement.divide',
          caller: this,
          params: [],
          message: `Cannot divide ${this.css()} by zero`,
          details: { code: 'CALIPERS_E_DIVIDE_BY_ZERO' },
        });
      }
      const result = this.#value / numericDivisor;
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

    absolute(): NonNegativeMeasurement<Unit> {
      // Math.abs is always >= 0, so the result is hardened to NonNegativeMeasurement
      // (the governing rule: a runtime restriction must also harden the type).
      return this.#clone(
        Math.abs(this.#value),
      ) as unknown as NonNegativeMeasurement<Unit>;
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
      if (violatesConstraints(value, this.#constraints)) {
        const result = `${toPlainDecimal(value)}${this.#unit}`;
        const bound = describeBound(this.#constraints);
        if (hardening === 'fail') {
          throwMeasurementMethodError({
            operation: 'css-calipers.Measurement.hardening',
            caller: this,
            params: [],
            message: `operation result ${result} breaks the hardened bound ${bound}`,
            details: { code: 'CALIPERS_E_HARDENING_BREACH' },
          });
        }
        if (hardening === 'warn') {
          console.warn(
            `css-calipers: operation result ${result} breaks the hardened bound ${bound}; dropping the constraint`,
          );
        }
        // 'ignore' + 'warn': drop the broken bound and proceed.
        return new Measurement(value, this.#unit);
      }
      // In bounds (or unhardened): carry the bound onto the derived value.
      return new Measurement(value, this.#unit, this.#constraints);
    }
  }

  // Single controlled point where the unit brand is asserted onto a freshly
  // created measurement (the brand is a compile-time-only phantom).
  const createMeasurement = <Unit extends string>(
    value: number,
    unit: Unit,
    constraints: Constraints = {},
  ): InscribedMeasurement<Unit> =>
    new Measurement(
      value,
      unit,
      constraints,
    ) as unknown as InscribedMeasurement<Unit>;

  const isMeasurement = (x: unknown): x is IMeasurement<string> =>
    x instanceof Measurement;

  function m(value: Scalar): InscribedMeasurement<'px'>;
  function m(
    value: Scalar,
    options: { context?: string },
  ): InscribedMeasurement<'px'>;
  function m<Unit extends string>(
    value: Scalar,
    unit: Unit,
    context?: string,
  ): InscribedMeasurement<Lowercase<Unit>>;
  function m<Unit extends string>(
    value: Scalar,
    options: MeasurementCreateOptions<Unit>,
  ): InscribedMeasurement<Lowercase<Unit>>;
  function m<Unit extends string>(
    value: Scalar,
    unitOrOptions:
      | Unit
      | MeasurementCreateOptions<Unit> = 'px' as Unit,
    context?: string,
  ): InscribedMeasurement<Lowercase<Unit>> {
    // Accept a plain number OR a typed scalar (i / f); coerce to a number here.
    // Only a typed scalar (object) is unwrapped via valueOf; a plain number, or
    // anything invalid (e.g. a missing value), passes through so the finite check
    // below still produces the graceful "non-finite" error rather than crashing.
    // (A hardened i/f's range bound is ingested below as `ingestedConstraints`.)
    const numericValue =
      typeof value === 'object' && value !== null
        ? value.valueOf()
        : value;
    // A hardened i / f carries a range bound; ingest it so m can re-check it
    // through arithmetic. An unhardened scalar (or plain number) carries none.
    const ingestedConstraints: Constraints =
      typeof value === 'object' &&
      value !== null &&
      typeof (value as { constraints?: unknown }).constraints ===
        'function'
        ? normalizeConstraints(
            (
              value as { constraints: () => Constraints }
            ).constraints(),
          )
        : {};
    const options =
      unitOrOptions && typeof unitOrOptions === 'object'
        ? unitOrOptions
        : { unit: unitOrOptions, context };
    const unit = (options.unit ?? 'px') as Unit;
    const contextLabel = options.context;
    const normalizedUnit = unit.toLowerCase() as Lowercase<Unit>;
    if (!Number.isFinite(numericValue)) {
      const errorPayload = buildMeasurementCreationError(
        numericValue,
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
    return createMeasurement(
      numericValue,
      normalizedUnit,
      ingestedConstraints,
    );
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

  // Value-constraint refinements. One factory builds the quartet (is / ensure / check /
  // hardenWith) from a numeric predicate and narrows to a constraint brand. The brand is
  // additive over `IMeasurement` and is dropped by arithmetic (which can cross a bound),
  // so a derived result must be re-checked. `nonNegative` / `nonPositive` / `inRange(...)`
  // are the built-ins.
  const makeMeasurementRefinement = <B>(spec: {
    predicate: (value: number) => boolean;
    message: (measurement: IMeasurement) => string;
    defaultFallback?: number;
  }): MeasurementRefinement<B> => {
    const is = <M extends IMeasurement>(
      measurement: M,
    ): measurement is M & B => spec.predicate(measurement.getValue());

    const ensure = <M extends IMeasurement>(
      measurement: M,
      context?: string,
    ): M & B => {
      if (!is(measurement)) {
        throwHelperError({
          operation: 'css-calipers.refinement.ensure',
          params: [
            measurement,
          ],
          message: spec.message(measurement),
          context,
          details: { code: 'CALIPERS_E_CONSTRAINT' },
        });
      }
      // A negated generic type-guard does not narrow the fall-through to `M & B`, so the
      // brand cast is necessary here (the runtime check above guarantees it holds).
      return measurement as M & B;
    };

    const check = <M extends IMeasurement>(
      measurement: M,
    ): MeasurementRefinementResult<M, B> =>
      is(measurement)
        ? { ok: true, value: measurement }
        : {
            ok: false,
            value: measurement,
            error: spec.message(measurement),
          };

    const hardenWith = <M extends IMeasurement>(
      measurement: M,
      fallback?: M & B,
    ): M & B => {
      if (is(measurement)) return measurement;
      if (fallback !== undefined) return fallback;
      const { defaultFallback } = spec;
      if (defaultFallback !== undefined) {
        return createMeasurement(
          defaultFallback,
          measurement.getUnit(),
        ) as unknown as M & B;
      }
      return throwHelperError({
        operation: 'css-calipers.refinement.hardenWith',
        params: [
          measurement,
        ],
        message:
          'no fallback provided and this refinement has no default fallback',
        details: { code: 'CALIPERS_E_CONSTRAINT' },
      });
    };

    return { is, ensure, check, hardenWith };
  };

  const nonNegative =
    makeMeasurementRefinement<GreaterOrEqualToZeroBrand>({
      predicate: (value) => value >= 0,
      message: (measurement) =>
        `expected a measurement >= 0 (got ${measurement.css()})`,
      defaultFallback: 0,
    });

  const nonPositive =
    makeMeasurementRefinement<SmallerOrEqualToZeroBrand>({
      predicate: (value) => value <= 0,
      message: (measurement) =>
        `expected a measurement <= 0 (got ${measurement.css()})`,
      defaultFallback: 0,
    });

  const inRange = <Min extends number, Max extends number>(
    min: Min,
    max: Max,
  ): MeasurementRefinement<InRangeBrand<Min, Max>> => {
    assertCondition(
      min <= max,
      `inRange: min (${min}) must be <= max (${max})`,
    );
    return makeMeasurementRefinement<InRangeBrand<Min, Max>>({
      predicate: (value) => value >= min && value <= max,
      message: (measurement) =>
        `expected a measurement in [${min}, ${max}] (got ${measurement.css()})`,
      defaultFallback: min,
    });
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
    makeMeasurementRefinement,
    nonNegative,
    nonPositive,
    inRange,
    getErrorConfig: errorStore.getErrorConfig,
    setErrorConfig: errorStore.setErrorConfig,
  } as const;
};

export type CoreApi = ReturnType<typeof createCoreApi>;
