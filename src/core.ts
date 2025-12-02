import {
  UNIT_DEFINITIONS,
  type UnitCategory,
  type UnitDefinition,
  type UnitDefinitionRecord,
  type UnitHelperName,
} from './unitDefinitions';
import {
  throwHelperError,
  throwMeasurementMethodError,
} from './internal/errors';

type UnitSymbol = UnitDefinitionRecord[keyof UnitDefinitionRecord]['unit'];

export type MeasurementString<Unit extends string = UnitSymbol> =
  `${number}${Unit}`;

type UnitBrand<Unit extends string> = { readonly __unitBrand: Unit };

export interface IMeasurement<Unit extends string = string> {
  css: () => string;
  toString: () => string;
  getUnit: () => Unit;
  getValue: () => number;
  valueOf: () => number;
  [Symbol.toPrimitive]: (hint: string) => string | number;
  isUnit: (unit: string) => boolean;
  assertUnit: (unit: string, context?: string) => void;
  assert: (
    predicate: (measurement: IMeasurement<Unit>) => boolean,
    message: string,
  ) => void;
  equals: (other: IMeasurement<string>) => boolean;
  compare: (other: IMeasurement<string>) => number;
  add: (delta: DeltaInput) => IMeasurement<Unit>;
  subtract: (delta: DeltaInput) => IMeasurement<Unit>;
  multiply: (factor: number) => IMeasurement<Unit>;
  divide: (divisor: number) => IMeasurement<Unit>;
  double: () => IMeasurement<Unit>;
  half: () => IMeasurement<Unit>;
  negation: (shouldNegate?: boolean) => IMeasurement<Unit>;
  absolute: () => IMeasurement<Unit>;
  round: (precision?: number) => IMeasurement<Unit>;
  floor: () => IMeasurement<Unit>;
  ceil: () => IMeasurement<Unit>;
  clamp: (
    min: IMeasurement<string>,
    max: IMeasurement<string>,
  ) => IMeasurement<Unit>;
}

type DeltaInput = number | IMeasurement<string>;

export function assertMatchingUnits<Unit extends string>(
  left: IMeasurement<Unit>,
  right: IMeasurement<Unit>,
  context: string,
): void;
export function assertMatchingUnits(
  left: IMeasurement<string>,
  right: IMeasurement<string>,
  context: string,
): void {
  const leftUnit = left.getUnit();
  const rightUnit = right.getUnit();
  if (leftUnit !== rightUnit) {
    throwHelperError({
      operation: 'css-calipers.assertMatchingUnits',
      params: [left, right],
      message: `measurement unit mismatch: ${leftUnit} vs ${rightUnit}`,
      context,
    });
  }
}

const deltaToNumber = (
  base: IMeasurement<string>,
  delta: DeltaInput,
): number => {
  if (typeof delta === 'number') return delta;
  assertMatchingUnits(base, delta, 'deltaToNumber');
  return delta.getValue();
};

class Measurement<Unit extends string>
  implements IMeasurement<Unit>, UnitBrand<Unit>
{
  readonly __unitBrand!: Unit;
  #value: number;
  #unit: Unit;

  constructor(value: number, unit: Unit) {
    if (!Number.isFinite(value)) {
      throwHelperError({
        operation: 'css-calipers.Measurement.constructor',
        params: [],
        message: `Non-finite measurement value: ${value}`,
      });
    }
    const normalizedUnit = unit.toLowerCase() as Unit;
    this.#value = value;
    this.#unit = normalizedUnit;
    Object.defineProperty(this, '__unitBrand', {
      value: normalizedUnit,
      enumerable: false,
      configurable: false,
      writable: false,
    });
  }

  css(): string {
    return `${this.#value}${this.#unit}`;
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

  add(delta: DeltaInput): Measurement<Unit> {
    const next = this.#value + deltaToNumber(this, delta);
    return this.#clone(next);
  }

  subtract(delta: DeltaInput): Measurement<Unit> {
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
      });
    }
    const result = this.#value / divisor;
    if (!Number.isFinite(result)) {
      throwMeasurementMethodError({
        operation: 'css-calipers.Measurement.divide',
        caller: this,
        params: [],
        message: 'Non-finite result',
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
    min: IMeasurement<string>,
    max: IMeasurement<string>,
  ): Measurement<Unit> {
    assertMatchingUnits(
      this,
      min as IMeasurement<Unit>,
      'clamp(min)',
    );
    assertMatchingUnits(
      this,
      max as IMeasurement<Unit>,
      'clamp(max)',
    );

    const minValue = min.getValue();
    const maxValue = max.getValue();

    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      throwMeasurementMethodError({
        operation: 'css-calipers.Measurement.clamp',
        caller: this,
        params: [min, max],
        message: 'clamp: expected finite bounds',
      });
    }
    if (minValue > maxValue) {
      throwMeasurementMethodError({
        operation: 'css-calipers.Measurement.clamp',
        caller: this,
        params: [min, max],
        message: `clamp: min (${min.css()}) must be <= max (${max.css()})`,
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

const createMeasurement = <Unit extends string>(
  value: number,
  unit: Unit,
): Measurement<Unit> => new Measurement(value, unit);

export const isMeasurement = (
  x: unknown,
): x is IMeasurement<string> => x instanceof Measurement;

export const m = <Unit extends string>(
  value: number,
  unit: Unit = 'px' as Unit,
): IMeasurement<Lowercase<Unit>> & UnitBrand<Lowercase<Unit>> =>
  createMeasurement(value, unit.toLowerCase() as Lowercase<Unit>);

export type BrandedMeasurement<Unit extends string> = IMeasurement<Unit> &
  UnitBrand<Unit>;

export type UnitHelper<Unit extends string = string> = ((
  value: number,
) => BrandedMeasurement<Unit>) & {
  unit: Unit;
};

export const makeUnitHelper = <Unit extends string>(
  unit: Unit,
): UnitHelper<Unit> => {
  const normalizedUnit = unit.toLowerCase() as Unit;
  const factory = (value: number) =>
    createMeasurement(value, normalizedUnit);
  return Object.assign(factory, {
    unit: normalizedUnit,
  }) as UnitHelper<Unit>;
};

export const makeUnitHelperFromDefinition = <
  Name extends UnitHelperName,
>(
  name: Name,
): UnitHelper<UnitDefinitionRecord[Name]['unit']> =>
  makeUnitHelper(UNIT_DEFINITIONS[name].unit);

export const measurementUnitMetadata = UNIT_DEFINITIONS;
export type MeasurementUnitDefinition = UnitDefinition;
export type MeasurementUnitCategory = UnitCategory;

export type MeasurementOf<T extends UnitHelper> = ReturnType<T>;

export type UnitGuard<T extends UnitHelper> = (
  value: unknown,
) => value is MeasurementOf<T>;

export type UnitAssertion<T extends UnitHelper> = (
  value: unknown,
  context?: string,
) => asserts value is MeasurementOf<T>;

export const makeUnitGuard = <T extends UnitHelper>(
  helper: T,
): UnitGuard<T> => {
  return (value: unknown): value is MeasurementOf<T> =>
    isMeasurement(value) && value.isUnit(helper.unit);
};

export const makeUnitAssert = <T extends UnitHelper>(
  helper: T,
): UnitAssertion<T> => {
  const guard = makeUnitGuard(helper);
  return (
    value: unknown,
    context?: string,
  ): asserts value is MeasurementOf<T> => {
    if (!guard(value)) {
      throwHelperError({
        operation: 'css-calipers.makeUnitAssert',
        params: isMeasurement(value) ? [value] : [],
        message: `Expected unit "${helper.unit}".`,
        context,
      });
    }
  };
};

export const hasCssMethod = (
  x: unknown,
): x is { css: () => string } => {
  return (
    typeof x === 'object' &&
    x !== null &&
    'css' in x &&
    typeof (x as { css: unknown }).css === 'function'
  );
};

export const measurementMin = <Unit extends string>(
  a: IMeasurement<Unit>,
  b: IMeasurement<Unit>,
): IMeasurement<Unit> => {
  assertMatchingUnits(a, b, 'measurementMin');
  return a.getValue() <= b.getValue() ? a : b;
};

export const measurementMax = <Unit extends string>(
  a: IMeasurement<Unit>,
  b: IMeasurement<Unit>,
): IMeasurement<Unit> => {
  assertMatchingUnits(a, b, 'measurementMax');
  return a.getValue() >= b.getValue() ? a : b;
};

export const assertUnit = <Unit extends string>(
  measurement: IMeasurement<Unit>,
  expectedUnit: string,
  context?: string,
) => measurement.assertUnit(expectedUnit, context);

export const assertCondition = (
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
    });
  }
};
