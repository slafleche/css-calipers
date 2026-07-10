/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates the `r()`
 * (ratio) primitive: a numerator over a denominator that renders as `n/d` CSS (for
 * `aspect-ratio` and friends). One argument implies a denominator of 1; `{ simplify:
 * true }` reduces and drops a denominator of 1. The helper family
 * (`simplifyRatio` / `reduceRatio` / `normalizeRatio` / `parseRatio`) and the
 * `withNumerator` / `withDenominator` replacers round it out. Throughout, `r()` and
 * the helpers also consume the `i()` / `f()` scalar primitives wherever a raw number
 * is accepted.
 */

import {
  f,
  i,
  normalizeRatio,
  parseRatio,
  r,
  reduceRatio,
  simplifyRatio,
} from '@css-bookends/css-calipers';

// --- construction and render ----------------------------------------------------

// Explicit numerator and denominator.
export const aspect = r(16, 9).css(); // '16/9'

// One argument implies a denominator of 1.
export const impliedDenominator = r(4).css(); // '4/1'
export const impliedValue = r(4).valueOf(); // 4

// --- the simplify option on creation --------------------------------------------

// `{ simplify: true }` reduces and omits the denominator when it becomes 1.
export const simplifiedToInt = r(6, 3, { simplify: true }).css(); // '2'
export const unsimplified = r(6, 3).css(); // '6/3'
export const simplifiedSingleArg = r(5, { simplify: true }).css(); // '5'

// --- the helper family ----------------------------------------------------------

// `normalizeRatio` reduces by the GCD but keeps the `n/d` style (no denominator drop).
export const normalized = normalizeRatio(r(2, 4)).css(); // '1/2'
// A negative denominator normalizes onto the numerator.
export const signNormalized = normalizeRatio(r(-2, 4)).css(); // '-1/2'

// `reduceRatio` is `normalizeRatio` under a clearer name (same `n/d` output style).
export const reduced = reduceRatio(r(6, 3)).css(); // '2/1'

// `simplifyRatio` reduces AND drops a denominator of 1 (the standalone form of the
// `{ simplify: true }` option).
export const simplified = simplifyRatio(r(21, 7)).css(); // '3'

// `parseRatio` reads a number or a string into `{ numerator, denominator }` parts,
// accepting both `/` and `:` delimiters; bad input returns `null`.
export const parsedSlash = parseRatio('3/4'); // { numerator: 3, denominator: 4 }
export const parsedColon = parseRatio('3:4'); // { numerator: 3, denominator: 4 }
export const parsedNumber = parseRatio(2); // { numerator: 2, denominator: 1 }
export const parsedBad = parseRatio('not-a-ratio'); // null

// --- replacing a part returns a NEW ratio ---------------------------------------

const base = r(2, 3);
export const swappedNumerator = base.withNumerator(4).css(); // '4/3'
export const swappedDenominator = base.withDenominator(5).css(); // '2/5'
export const baseUntouched = base.css(); // '2/3'

// --- INTEROP: r() and the helpers consume i() / f() scalars ----------------------

// `i()` integers on both numerator and denominator.
export const fromIntegers = r(i(16), i(9)).css(); // '16/9'

// `f()` floats are accepted too; the raw fractional values are kept.
export const fromFloats = r(f(1.5), f(3)).css(); // '1.5/3'

// Mix a float numerator with a raw-number denominator.
export const mixedScalar = r(f(1.5), 2).css(); // '1.5/2'

// A single `i()` argument implies a denominator of 1.
export const singleInteger = r(i(4)).css(); // '4/1'

// `{ simplify: true }` works through scalar inputs.
export const simplifiedFromIntegers = r(i(6), i(3), {
  simplify: true,
}).css(); // '2'

// `withNumerator` accepts a scalar.
export const replaceWithScalar = r(2, 3).withNumerator(i(4)).css(); // '4/3'

// `parseRatio` accepts scalars (denominator implied 1).
export const parsedInteger = parseRatio(i(5)); // { numerator: 5, denominator: 1 }
export const parsedFloat = parseRatio(f(2.5)); // { numerator: 2.5, denominator: 1 }
