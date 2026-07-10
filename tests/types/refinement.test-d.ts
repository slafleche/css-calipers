import {
  expectAssignable,
  expectError,
  expectNotAssignable,
} from 'tsd';

import {
  type GreaterOrEqualToZeroBrand,
  type GreaterOrEqualToZeroMeasurement,
  type IMeasurement,
  inRange,
  type InRangeBrand,
  type InRangeMeasurement,
  m,
  makeMeasurementRefinement,
  type MeasurementRefinement,
  mPercent,
  nonNegative,
  type NonNegativeMeasurement,
  nonPositive,
  type NonPositiveMeasurement,
  type SmallerOrEqualToZeroBrand,
  type SmallerOrEqualToZeroMeasurement,
} from '../../dist/esm';

// The built-ins are MeasurementRefinement objects over their constraint brand.
expectAssignable<MeasurementRefinement<GreaterOrEqualToZeroBrand>>(
  nonNegative,
);
expectAssignable<MeasurementRefinement<SmallerOrEqualToZeroBrand>>(
  nonPositive,
);
expectAssignable<MeasurementRefinement<InRangeBrand<0, 10>>>(
  inRange(0, 10),
);

// ensure narrows to the matching brand, preserving the unit; the alias matches.
const geZero = nonNegative.ensure(m(4, 'px'));
expectAssignable<GreaterOrEqualToZeroMeasurement<'px'>>(geZero);
expectAssignable<NonNegativeMeasurement<'px'>>(geZero);
expectAssignable<IMeasurement<'px'>>(geZero);

const leZeroPx = nonPositive.ensure(m(-4, 'px'));
expectAssignable<SmallerOrEqualToZeroMeasurement<'px'>>(leZeroPx);
expectAssignable<NonPositiveMeasurement<'px'>>(leZeroPx);

// Unit is preserved across units, including percentages.
const rangedPct = inRange(0, 100).ensure(mPercent(50));
expectAssignable<InRangeMeasurement<'%'>>(rangedPct);
expectAssignable<IMeasurement<'%'>>(rangedPct);

// inRange exposes its literal bounds in the type (exact-bound, not containment).
const r0to10 = inRange(0, 10).ensure(m(4, 'px'));
expectAssignable<InRangeMeasurement<'px', 0, 10>>(r0to10);
expectAssignable<InRangeMeasurement<'px'>>(r0to10); // assignable to the unbounded form
expectNotAssignable<InRangeMeasurement<'px', 0, 5>>(r0to10); // a different range is distinct

declare function needs0to10(
  value: InRangeMeasurement<'px', 0, 10>,
): void;
needs0to10(r0to10);
expectError(needs0to10(inRange(0, 5).ensure(m(4, 'px'))));
expectError(needs0to10(m(4, 'px')));

// is narrows in a conditional.
const candidate = m(4, 'px');
if (nonNegative.is(candidate)) {
  expectAssignable<NonNegativeMeasurement<'px'>>(candidate);
}

// check is a discriminated result; the ok branch exposes the branded value.
const result = nonNegative.check(m(4, 'px'));
if (result.ok) {
  expectAssignable<NonNegativeMeasurement<'px'>>(result.value);
} else {
  expectAssignable<IMeasurement<'px'>>(result.value);
  expectAssignable<string>(result.error);
}

// hardenWith returns the branded type on both branches.
expectAssignable<NonNegativeMeasurement<'px'>>(
  nonNegative.hardenWith(m(4, 'px')),
);
expectAssignable<NonNegativeMeasurement<'px'>>(
  nonNegative.hardenWith(m(-4, 'px'), nonNegative.ensure(m(0, 'px'))),
);

// hardenWith's explicit fallback must already be branded.
expectError(nonNegative.hardenWith(m(-4, 'px'), m(0, 'px')));

// A plain measurement carries no constraint brand.
expectNotAssignable<NonNegativeMeasurement<'px'>>(m(4, 'px'));
expectNotAssignable<NonPositiveMeasurement<'px'>>(m(4, 'px'));
expectNotAssignable<InRangeMeasurement<'px'>>(m(4, 'px'));

// The constraints are distinct brands.
expectNotAssignable<NonPositiveMeasurement<'px'>>(geZero);
expectNotAssignable<NonNegativeMeasurement<'px'>>(leZeroPx);
expectNotAssignable<NonNegativeMeasurement<'%'>>(rangedPct);
expectNotAssignable<InRangeMeasurement<'px'>>(geZero);

// Arithmetic drops the brand - the result must be re-checked.
expectNotAssignable<NonNegativeMeasurement<'px'>>(
  geZero.subtract(m(2, 'px')),
);
expectNotAssignable<NonNegativeMeasurement<'px'>>(geZero.add(1));
expectNotAssignable<NonNegativeMeasurement<'px'>>(geZero.negation());

// A function can demand the hardened type and reject a plain or mis-branded value.
declare function needsNonNegative(
  value: NonNegativeMeasurement<'px'>,
): void;
needsNonNegative(geZero);
expectError(needsNonNegative(m(4, 'px')));
expectError(needsNonNegative(leZeroPx));

// makeMeasurementRefinement is generic over an arbitrary brand.
declare const evenBrand: unique symbol;
type EvenBrand = { readonly [evenBrand]: true };
const even = makeMeasurementRefinement<EvenBrand>({
  predicate: (value) => value % 2 === 0,
  message: (measurement) => `expected even, got ${measurement.css()}`,
});
expectAssignable<MeasurementRefinement<EvenBrand>>(even);
const evenPx = even.ensure(m(4, 'px'));
expectAssignable<IMeasurement<'px'> & EvenBrand>(evenPx);
expectAssignable<IMeasurement<'px'>>(evenPx);
expectNotAssignable<NonNegativeMeasurement<'px'>>(evenPx);

// absolute() is hardened: the result is always non-negative (governing rule).
const abs = m(-4, 'px').absolute();
expectAssignable<NonNegativeMeasurement<'px'>>(abs);
needsNonNegative(m(-8, 'px').absolute());
expectAssignable<IMeasurement<'px'>>(abs);
