import { f, type IFloat, isFloat } from './float';
import { i, type IInteger, isInteger } from './integer';
import { type Scalar, toNumber } from './scalar';

/** A value `ratio` can consume: a raw number or a typed scalar primitive. */
export type RatioValue = Scalar;

const ratioValueToNumber = (value: RatioValue): number =>
  toNumber(value);

const isRatioValue = (value: unknown): value is RatioValue =>
  typeof value === 'number' || isInteger(value) || isFloat(value);

/** Recover a typed scalar from a ratio operand: a typed operand comes back INTACT;
 * a raw number reconstructs by value (whole -> i(), fractional -> f()). */
const toScalar = (value: RatioValue): IInteger | IFloat => {
  if (isInteger(value) || isFloat(value)) return value;
  return Number.isInteger(value) ? i(value) : f(value);
};

export interface IRatio {
  css: () => string;
  toString: () => string;
  valueOf: () => number;
  numerator: () => number;
  denominator: () => number;
  /** the numerator recovered as a typed scalar (intact if one went in). */
  numeratorScalar: () => IInteger | IFloat;
  /** the denominator recovered as a typed scalar (intact if one went in). */
  denominatorScalar: () => IInteger | IFloat;
  withNumerator: (numerator: RatioValue) => IRatio;
  withDenominator: (denominator: RatioValue) => IRatio;
}

export type RatioParts = {
  numerator: number;
  denominator: number;
};

class RatioImpl implements IRatio {
  #numerator: number;
  #denominator: number;
  #numeratorScalar: IInteger | IFloat;
  #denominatorScalar: IInteger | IFloat;
  #omitDenominatorWhenOne: boolean;

  constructor(
    numerator: RatioValue,
    denominator: RatioValue,
    options: { omitDenominatorWhenOne?: boolean } = {},
  ) {
    const numeratorValue = ratioValueToNumber(numerator);
    const denominatorValue = ratioValueToNumber(denominator);
    if (
      !Number.isFinite(numeratorValue) ||
      !Number.isFinite(denominatorValue)
    ) {
      throw new Error('Ratio values must be finite numbers.');
    }
    if (denominatorValue === 0) {
      throw new Error('Ratio denominator cannot be zero.');
    }
    this.#numerator = numeratorValue;
    this.#denominator = denominatorValue;
    this.#numeratorScalar = toScalar(numerator);
    this.#denominatorScalar = toScalar(denominator);
    this.#omitDenominatorWhenOne =
      options.omitDenominatorWhenOne ?? false;
  }

  numerator(): number {
    return this.#numerator;
  }

  denominator(): number {
    return this.#denominator;
  }

  numeratorScalar(): IInteger | IFloat {
    return this.#numeratorScalar;
  }

  denominatorScalar(): IInteger | IFloat {
    return this.#denominatorScalar;
  }

  withNumerator(numerator: RatioValue): IRatio {
    return new RatioImpl(numerator, this.#denominatorScalar);
  }

  withDenominator(denominator: RatioValue): IRatio {
    return new RatioImpl(this.#numeratorScalar, denominator);
  }

  valueOf(): number {
    return this.#numerator / this.#denominator;
  }

  css(): string {
    if (this.#omitDenominatorWhenOne && this.#denominator === 1) {
      return String(this.#numerator);
    }
    return `${this.#numerator}/${this.#denominator}`;
  }

  toString(): string {
    return this.css();
  }
}

type RatioCreateOptions = {
  simplify?: boolean;
};

export function r(
  denominator: RatioValue,
  options?: RatioCreateOptions,
): IRatio;
export function r(
  numerator: RatioValue,
  denominator: RatioValue,
  options?: RatioCreateOptions,
): IRatio;
export function r(
  numeratorOrDenominator: RatioValue,
  denominatorOrOptions?: RatioValue | RatioCreateOptions,
  options?: RatioCreateOptions,
): IRatio {
  let resolvedDenominator: RatioValue = 1;
  let resolvedOptions = options;
  if (isRatioValue(denominatorOrOptions)) {
    resolvedDenominator = denominatorOrOptions;
  } else if (denominatorOrOptions !== undefined) {
    resolvedOptions = denominatorOrOptions;
  }
  const ratio = new RatioImpl(
    numeratorOrDenominator,
    resolvedDenominator,
  );
  return resolvedOptions?.simplify ? simplifyRatio(ratio) : ratio;
}

export const isRatio = (value: unknown): value is IRatio => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'css' in value &&
    'numerator' in value &&
    'denominator' in value &&
    typeof (value as IRatio).css === 'function' &&
    typeof (value as IRatio).numerator === 'function' &&
    typeof (value as IRatio).denominator === 'function'
  );
};

export const parseRatio = (
  value: number | string | IRatio | IInteger | IFloat,
): RatioParts | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? { numerator: value, denominator: 1 }
      : null;
  }
  if (isInteger(value) || isFloat(value)) {
    const numeric = value.valueOf();
    return Number.isFinite(numeric)
      ? { numerator: numeric, denominator: 1 }
      : null;
  }
  if (isRatio(value)) {
    return {
      numerator: value.numerator(),
      denominator: value.denominator(),
    };
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes('/') || trimmed.includes(':')) {
    const delimiter = trimmed.includes('/') ? '/' : ':';
    const [
      left,
      right,
    ] = trimmed.split(delimiter);
    if (left === undefined || right === undefined) return null;
    const numerator = Number(left.trim());
    const denominator = Number(right.trim());
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator)
    ) {
      return null;
    }
    if (denominator === 0) return null;
    return { numerator, denominator };
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed)
    ? { numerator: parsed, denominator: 1 }
    : null;
};

export const normalizeRatio = (ratio: IRatio): IRatio => {
  let numerator = ratio.numerator();
  let denominator = ratio.denominator();

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    throw new Error('Ratio values must be finite numbers.');
  }
  if (denominator === 0) {
    throw new Error('Ratio denominator cannot be zero.');
  }

  if (
    !Number.isInteger(numerator) ||
    !Number.isInteger(denominator)
  ) {
    return new RatioImpl(numerator, denominator);
  }

  if (denominator < 0) {
    numerator = -numerator;
    denominator = Math.abs(denominator);
  }

  const gcd = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const next = x % y;
      x = y;
      y = next;
    }
    return x === 0 ? 1 : x;
  };

  const divisor = gcd(numerator, denominator);
  return new RatioImpl(numerator / divisor, denominator / divisor);
};

export const reduceRatio = (ratio: IRatio): IRatio =>
  normalizeRatio(ratio);
export const simplifyRatio = (ratio: IRatio): IRatio => {
  const reduced = normalizeRatio(ratio);
  return new RatioImpl(reduced.numerator(), reduced.denominator(), {
    omitDenominatorWhenOne: true,
  });
};

export const ratioToFloat = (ratio: IRatio): number =>
  ratio.numerator() / ratio.denominator();

export const toFloat = (ratio: IRatio): number => ratioToFloat(ratio);
