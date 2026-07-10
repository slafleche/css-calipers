import {
  m,
  nonNegative,
  type NonNegativeMeasurement,
} from '@css-bookends/css-calipers';

/**
 * Hardening a value that arrives from outside the type system (an API, CMS, or user
 * input) into a typed non-negative measurement.
 *
 * Padding cannot be negative, so a function that demands `NonNegativeMeasurement` cannot
 * be called with a raw, unchecked measurement; the caller must pass it through a
 * refinement first. Three ways to do that, depending on how you want to handle bad input.
 */

// Requires a non-negative measurement. A plain `m(...)` is a compile error here.
export const paddingStyle = (
  padding: NonNegativeMeasurement<'px'>,
): { padding: string } => ({ padding: padding.css() });

// 1. Fail loud: throw if the value is invalid (use when it must already be valid).
export const strictPadding = (
  apiValue: number,
): { padding: string } =>
  paddingStyle(nonNegative.ensure(m(apiValue, 'px')));

// 2. Branch with the guard.
export const labelledPadding = (
  apiValue: number,
): { padding: string; clamped: boolean } => {
  const candidate = m(apiValue, 'px');
  if (nonNegative.is(candidate)) {
    return { padding: candidate.css(), clamped: false };
  }
  return { padding: '0px', clamped: true };
};

// 3. Graceful fallback in one call: invalid input falls back (default 0px), never throws.
export const safePadding = (apiValue: number): { padding: string } =>
  paddingStyle(nonNegative.hardenWith(m(apiValue, 'px')));

// 3b. With an explicit, pre-hardened fallback.
const MIN_PADDING = nonNegative.ensure(m(4, 'px'));
export const paddingWithMin = (
  apiValue: number,
): { padding: string } =>
  paddingStyle(
    nonNegative.hardenWith(m(apiValue, 'px'), MIN_PADDING),
  );
