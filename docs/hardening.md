# Value hardening

Most CSS values have a restricted domain: padding is `>= 0`, opacity is `0..1`, and so on.
CSS-Calipers lets you enforce those restrictions and carry the proof in the type, so a
function can demand "a non-negative measurement" and the compiler rejects anything that
has not been checked.

## The governing rule

**Any restriction applied to a measurement at runtime also hardens the TypeScript type.**

A check that only runs at runtime is half the value. The point is to get the guarantee
while you write code, as a red squiggle, before anything executes. So every refinement
returns a **branded** type whose brand reflects the actual constraint, and `inRange`
carries its bounds. New constraints follow the same shape: a runtime predicate plus a
brand that records it.

## The pattern

A **refinement** takes a measurement, checks a constraint at runtime, and returns the same
value narrowed to a branded type that proves the check happened. Brands are keyed by a
module-private symbol, so the only way to obtain one is to pass through a refinement (or
through `absolute()`, see below). This is the "smart constructor" / "parse, don't
validate" idea, the same family as Zod `.brand()`, io-ts refinements, and Effect `Brand`.

The brand is dropped by arithmetic, because a derived value can leave the valid domain
(`a.subtract(b)` can go negative). Re-check the result if you need the guarantee again.

## The quartet

Each refinement exposes four members:

```ts
import { m, nonNegative } from '@css-bookends/css-calipers';

nonNegative.is(m(x));          // guard: boolean, narrows on success
nonNegative.ensure(m(x));      // throws if invalid, else returns the branded value
nonNegative.check(m(x));       // { ok, value, error } - no throw
nonNegative.hardenWith(m(x));  // returns the value if valid, else a fallback
```

- **`is`** is the primitive; the others build on it. Use it to branch.
- **`ensure`** is "fail loud": for values that must already be valid.
- **`check`** returns a discriminated result when you want the failure reason.
- **`hardenWith`** is "validate or fall back" in one call, like Zod `.catch` / fp-ts
  `getOrElse`. It is total: the fallback is itself branded, defaulting to a known-good
  value built in the candidate's own unit (`0` for the zero-anchored refinements, `min`
  for `inRange`). Pass an explicit fallback to override.

The value is never mutated; on success the same instance is returned.

## Built-in refinements

- `nonNegative` - `>= 0`. Type: `NonNegativeMeasurement` (alias of
  `GreaterOrEqualToZeroMeasurement`).
- `nonPositive` - `<= 0`. Type: `NonPositiveMeasurement` (alias of
  `SmallerOrEqualToZeroMeasurement`).
- `inRange(min, max)` - inclusive `[min, max]`; throws at construction if `min > max`.
  Type: `InRangeMeasurement`.

### Typed range bounds

`inRange` carries its literal bounds in the type, so the range is visible to callers:

```ts
import { inRange, m, type InRangeMeasurement } from '@css-bookends/css-calipers';

const opacity = (value: InRangeMeasurement<'%', 0, 100>) => ({ opacity: value.css() });

opacity(inRange(0, 100).ensure(m(50, '%'))); // ok
opacity(inRange(0, 5).ensure(m(4, '%')));    // compile error: different bounds
opacity(m(50, '%'));                          // compile error: not range-checked
```

Assignability is by **exact bounds**, not range containment: TypeScript cannot compare
numeric literals, so `[0, 5]` is not accepted where `[0, 10]` is required even though it is
numerically inside it. A specific range is assignable to the unbounded
`InRangeMeasurement<'%'>`.

## Hardened operations

Operations whose output domain is known are hardened too. `absolute()` is always `>= 0`,
so it returns `NonNegativeMeasurement` directly, no separate check needed:

```ts
const safe = m(apiValue, 'px').absolute(); // NonNegativeMeasurement<'px'>
```

## Custom refinements

Build your own with `makeMeasurementRefinement`. Declare a brand (a module-private
`unique symbol`, so it cannot be forged), then pass a predicate:

```ts
import { makeMeasurementRefinement } from '@css-bookends/css-calipers';

declare const evenBrand: unique symbol;
type EvenBrand = { readonly [evenBrand]: true };

export const even = makeMeasurementRefinement<EvenBrand>({
  predicate: (value) => value % 2 === 0,
  message: (measurement) => `expected an even value (got ${measurement.css()})`,
  defaultFallback: 0, // optional; enables hardenWith() with no explicit fallback
});
```

You get the full quartet over your `EvenBrand`.

## When NOT to harden the type

Two helpers stay deliberately untyped because they cannot narrow generically; reach for
the refinements above when you want the type guarantee:

- `measurement.assert(predicate, message)` - an arbitrary runtime predicate; returns
  `void`, does not narrow.
- `assertUnit(...)` - a runtime unit string. For typed unit narrowing use the unit-specific
  asserts (for example `assertPercentMeasurement`) or `makeUnitAssert`, which return
  `asserts value is ...`.

## Examples

- [examples/hardening-fallback.example.ts](../examples/hardening-fallback.example.ts) -
  an API value hardened with `ensure` / `is` / `hardenWith`.
- [examples/hardening-range.example.ts](../examples/hardening-range.example.ts) - a typed
  `inRange` bound flowing into a function that demands it.
