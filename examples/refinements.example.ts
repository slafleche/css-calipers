/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates two value-
 * constraint refinements beyond `nonNegative` (see hardening-fallback.example.ts) and
 * `inRange` (see hardening-range.example.ts):
 *
 *   - `nonPositive` (`<= 0`), shown through the full quartet: `is` (guard),
 *     `ensure` (throws on failure), `check` (non-throwing result), and `hardenWith`
 *     (validate or fall back).
 *   - `makeMeasurementRefinement`, the builder behind the built-ins, used to declare a
 *     custom constraint (here: an even value) that gets the same quartet over its own
 *     brand.
 *
 * A refinement never mutates: on success the SAME instance is returned, narrowed to a
 * branded type that proves the check happened.
 */

import {
  m,
  makeMeasurementRefinement,
  nonPositive,
} from '@css-bookends/css-calipers';

// --- nonPositive: the quartet ---------------------------------------------------

// `is` is the guard: a boolean that narrows on success. Zero satisfies `<= 0`.
export const negativeIsNonPositive = nonPositive.is(m(-4)); // true
export const zeroIsNonPositive = nonPositive.is(m(0)); // true
export const positiveIsNonPositive = nonPositive.is(m(1)); // false

// `ensure` is "fail loud": it returns the branded value, or throws on a positive one.
export const ensuredZero = nonPositive.ensure(m(0)).getValue(); // 0
export const ensurePositiveThrows = (): string => {
  try {
    nonPositive.ensure(m(1));
    return 'no throw';
  } catch (error) {
    // message includes the constraint '<= 0'
    return error instanceof Error ? error.message : 'unknown';
  }
};

// `check` is non-throwing: a discriminated `{ ok, value, error }` result.
export const positiveCheck = (): boolean => {
  const result = nonPositive.check(m(5));
  // result.ok === false; result.error contains '<= 0'
  return result.ok;
}; // false

// `hardenWith` is "validate or fall back" in one call: an invalid value falls back to
// zero in the candidate's own unit, and never throws.
export const hardenedPositive = nonPositive
  .hardenWith(m(4, 'em'))
  .css(); // '0em'

// --- makeMeasurementRefinement: a custom constraint -----------------------------

// Declare a brand keyed by a module-private property, then pass a numeric predicate and
// a message. The result exposes the SAME quartet over the brand.
const even = makeMeasurementRefinement<{ readonly even: true }>({
  predicate: (value) => value % 2 === 0,
  message: (measurement) =>
    `expected an even value (got ${measurement.css()})`,
  // `defaultFallback` (optional) lets `hardenWith` work with no explicit fallback.
  defaultFallback: 0,
});

export const fourIsEven = even.is(m(4)); // true
export const threeIsEven = even.is(m(3)); // false
export const ensuredEven = even.ensure(m(4)).getValue(); // 4
export const oddCheckFails = even.check(m(3)).ok; // false

// `hardenWith` falls back to the declared default (0) when the value is odd.
export const hardenedOdd = even.hardenWith(m(3)).getValue(); // 0
