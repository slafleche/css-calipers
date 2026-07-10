import {
  inRange,
  type InRangeMeasurement,
  m,
} from '@css-bookends/css-calipers';

/**
 * `inRange(min, max)` exposes its bounds in the type. A function can demand a measurement
 * proven to be within a specific range, and the compiler rejects values from a different
 * range or unchecked values. Assignability is by exact bounds, not range containment.
 */

const percent0to100 = inRange(0, 100);

// Requires a percentage proven to be within [0, 100].
export const opacityRule = (
  value: InRangeMeasurement<'%', 0, 100>,
): { opacity: string } => ({ opacity: value.css() });

// Fail loud when the value must already be in range.
export const strictOpacity = (
  apiValue: number,
): { opacity: string } =>
  opacityRule(percent0to100.ensure(m(apiValue, '%')));

// Graceful: out-of-range falls back to the minimum (0%), never throws.
export const safeOpacity = (apiValue: number): { opacity: string } =>
  opacityRule(percent0to100.hardenWith(m(apiValue, '%')));
