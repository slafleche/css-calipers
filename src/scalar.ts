import type { IFloat } from './float';
import type { IInteger } from './integer';

/**
 * A plain number or a typed scalar primitive (`i()` / `f()`). The shared
 * operand type for arithmetic across measurements, integers, and floats, so the
 * typed scalars interoperate (e.g. `m(8).multiply(i(2))`, `i(4).multiply(f(2))`).
 */
export type Scalar = number | IInteger | IFloat;

/**
 * Coerce a {@link Scalar} to a plain number. Mirrors the per-module `coerce`
 * helpers in `integer.ts` / `float.ts` and `ratioValueToNumber` in `ratio.ts`.
 */
export const toNumber = (value: Scalar): number =>
  typeof value === 'number' ? value : value.valueOf();
