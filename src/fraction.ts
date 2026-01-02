export interface IFraction {
  css: () => string;
  toString: () => string;
  valueOf: () => number;
  numerator: () => number;
  denominator: () => number;
  withNumerator: (numerator: number) => IFraction;
  withDenominator: (denominator: number) => IFraction;
}

export type Fraction = IFraction;

export type RatioParts = {
  numerator: number;
  denominator: number;
};

class FractionImpl implements IFraction {
  #numerator: number;
  #denominator: number;
  #omitDenominatorWhenOne: boolean;

  constructor(
    numerator: number,
    denominator: number,
    options: { omitDenominatorWhenOne?: boolean } = {},
  ) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      throw new Error('Fraction values must be finite numbers.');
    }
    if (denominator === 0) {
      throw new Error('Fraction denominator cannot be zero.');
    }
    this.#numerator = numerator;
    this.#denominator = denominator;
    this.#omitDenominatorWhenOne =
      options.omitDenominatorWhenOne ?? false;
  }

  numerator(): number {
    return this.#numerator;
  }

  denominator(): number {
    return this.#denominator;
  }

  withNumerator(numerator: number): IFraction {
    return new FractionImpl(numerator, this.#denominator);
  }

  withDenominator(denominator: number): IFraction {
    return new FractionImpl(this.#numerator, denominator);
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

export function r(denominator: number): Fraction;
export function r(numerator: number, denominator: number): Fraction;
export function r(
  numeratorOrDenominator: number,
  denominator?: number,
): Fraction {
  const numerator = denominator === undefined ? numeratorOrDenominator : numeratorOrDenominator;
  const resolvedDenominator = denominator === undefined ? 1 : denominator;
  return new FractionImpl(numerator, resolvedDenominator);
}

export const isFraction = (value: unknown): value is IFraction => {
  return (
    typeof value === "object" &&
    value !== null &&
    "css" in value &&
    "numerator" in value &&
    "denominator" in value &&
    typeof (value as IFraction).css === "function" &&
    typeof (value as IFraction).numerator === "function" &&
    typeof (value as IFraction).denominator === "function"
  );
};

export const parseRatio = (value: number | string | IFraction): RatioParts | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? { numerator: value, denominator: 1 } : null;
  }
  if (isFraction(value)) {
    return { numerator: value.numerator(), denominator: value.denominator() };
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("/")) {
    const [left, right] = trimmed.split("/");
    if (left === undefined || right === undefined) return null;
    const numerator = Number(left.trim());
    const denominator = Number(right.trim());
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
    if (denominator === 0) return null;
    return { numerator, denominator };
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? { numerator: parsed, denominator: 1 } : null;
};

export const normalizeFraction = (fraction: IFraction): IFraction => {
  let numerator = fraction.numerator();
  let denominator = fraction.denominator();

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    throw new Error("Fraction values must be finite numbers.");
  }
  if (denominator === 0) {
    throw new Error("Fraction denominator cannot be zero.");
  }

  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    return new FractionImpl(numerator, denominator);
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
  return new FractionImpl(numerator / divisor, denominator / divisor);
};

export const reduceFraction = (fraction: IFraction): IFraction =>
  normalizeFraction(fraction);

export const simplifyFraction = (fraction: IFraction): IFraction => {
  const reduced = normalizeFraction(fraction);
  return new FractionImpl(
    reduced.numerator(),
    reduced.denominator(),
    { omitDenominatorWhenOne: true },
  );
};

export const fractionToFloat = (fraction: IFraction): number =>
  fraction.numerator() / fraction.denominator();
