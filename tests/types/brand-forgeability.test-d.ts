import { expectAssignable, expectNotAssignable } from 'tsd';

import {
  type IMeasurement,
  type InRangeMeasurement,
  type InscribedMeasurement,
  m,
  type NonNegativeMeasurement,
} from '../../dist/esm';

/*
 * Publish-readiness pin: BRAND FORGEABILITY is a compile-time contract.
 *
 * The unit brand and the value-constraint brands (nonNegative, nonPositive,
 * inRange) are phantom types keyed by module-private `unique symbol`s. That
 * makes them:
 *  - UN-nameable from outside the module, so no consumer object literal can
 *    structurally satisfy a branded type (the honest guarantee), AND
 *  - forgeable ONLY by a deliberate `as` cast, which TypeScript always permits
 *    through `unknown` (the unavoidable escape hatch in any phantom-brand
 *    scheme).
 *
 * The brands are a STATIC contract, NOT a runtime guard: the runtime object is
 * a plain measurement either way. These tests pin both halves so the guarantee
 * (and its boundary) cannot silently change.
 */

// --- The honest guarantee: structural forging is rejected. -----------------

// A bare object cannot name the unit brand, so it is not an InscribedMeasurement.
expectNotAssignable<InscribedMeasurement<'px'>>({
  css: () => '10px',
  getUnit: () => 'px',
  getValue: () => 10,
});

// A plain (un-refined) measurement carries no constraint brand.
expectNotAssignable<NonNegativeMeasurement<'px'>>(m(4, 'px'));
expectNotAssignable<InRangeMeasurement<'px', 0, 10>>(m(4, 'px'));

// --- The boundary: a deliberate `as` cast DOES forge the brand at compile -
//     time. This is expected and documented; it bypasses no runtime check
//     because there is no runtime brand. We pin that the cast compiles, so the
//     "compile-time contract, not a runtime guarantee" framing stays true. -----

const plain = m(-5, 'px'); // value is negative; no runtime check is performed.

// Forging the non-negative brand by cast type-checks (compile-time only).
const forgedNonNegative =
  plain as unknown as NonNegativeMeasurement<'px'>;
expectAssignable<NonNegativeMeasurement<'px'>>(forgedNonNegative);

// Forging an inRange brand by cast type-checks too.
const forgedRange = plain as unknown as InRangeMeasurement<
  'px',
  0,
  10
>;
expectAssignable<InRangeMeasurement<'px', 0, 10>>(forgedRange);

// The forged value is still a perfectly ordinary measurement underneath.
expectAssignable<IMeasurement<'px'>>(forgedNonNegative);
