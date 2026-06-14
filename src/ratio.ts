export interface IRatio {
  css: () => string;
  toString: () => string;
  valueOf: () => number;
  numerator: () => number;
  denominator: () => number;
  withNumerator: (numerator: number) => IRatio;
  withDenominator: (denominator: number) => IRatio;
}

export type RatioParts = {
  numerator: number;
  denominator: number;
};

class RatioImpl implements IRatio {
  #numerator: number;
  #denominator: number;
  #omitDenominatorWhenOne: boolean;

  constructor(
    numerator: number,
    denominator: number,
    options: { omitDenominatorWhenOne?: boolean } = {},
  ) {
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator)
    ) {
      throw new Error('Ratio values must be finite numbers.');
    }
    if (denominator === 0) {
      throw new Error('Ratio denominator cannot be zero.');
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

  withNumerator(numerator: number): IRatio {
    return new RatioImpl(numerator, this.#denominator);
  }

  withDenominator(denominator: number): IRatio {
    return new RatioImpl(this.#numerator, denominator);
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
  denominator: number,
  options?: RatioCreateOptions,
): IRatio;
export function r(
  numerator: number,
  denominator: number,
  options?: RatioCreateOptions,
): IRatio;
export function r(
  numeratorOrDenominator: number,
  denominatorOrOptions?: number | RatioCreateOptions,
  options?: RatioCreateOptions,
): IRatio {
  const hasOptionsArg =
    typeof denominatorOrOptions === 'object' &&
    denominatorOrOptions !== null;
  const resolvedOptions = hasOptionsArg
    ? denominatorOrOptions
    : options;
  const numerator = numeratorOrDenominator;
  const resolvedDenominator = hasOptionsArg
    ? 1
    : (denominatorOrOptions ?? 1);
  const ratio = new RatioImpl(numerator, resolvedDenominator);
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
  value: number | string | IRatio,
): RatioParts | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? { numerator: value, denominator: 1 }
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
