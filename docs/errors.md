# Errors and error handling

How CSS-Calipers reports problems, the common error codes, and how to configure error
output. For the README overview, see ["Errors"](../README.md#errors).

## Error behavior

- Operations are fail-fast: when you call helpers like `add`, `divide`, `clamp`,
  `measurementMin` / `measurementMax`, or the assertion helpers with invalid input (for
  example, mismatched units or non-finite values), CSS-Calipers throws a normal `Error`.
- Error messages include the operation name (for example,
  `css-calipers.Measurement.divide` or `css-calipers.assertMatchingUnits`), the relevant
  values/units, and any context string you pass in.
- The library does not catch these errors for you. You choose where to place assertions and
  where (if anywhere) to catch and handle exceptions.
- In production, a common pattern is to wrap assertions in dev-only guards (such as
  `if (process.env.NODE_ENV !== 'production')`) or to enforce invariants in tests, so checks
  stay cheap and predictable at runtime.

For concrete uses of these errors in tests and dev-only guards, see `TESTING.md` and the
validation examples:
[validation-unit-tests](../examples/validation-unit-tests.example.ts) and
[validation-and-runtime-checks](../examples/validation-and-runtime-checks.example.ts).

## Common errors

### Non-finite measurement value

```
css-calipers.m: Non-finite measurement value: undefined [code=CALIPERS_E_NONFINITE | helper=m | inputs=value=undefined, unit=px | stack=...]
```

- **Means:** a measurement was constructed with `undefined`, `NaN`, or `Infinity`.
- **Fix:** provide a real numeric value and a unit (`m(12)`, `m(12, "px")`). Add a context
  label so the error points to the calling helper or token
  (`m(12, { context: "tokens.cardWidth" })`).

### Unit mismatch

```
css-calipers.assertMatchingUnits: measurement unit mismatch: px vs em [code=CALIPERS_E_UNIT_MISMATCH]
```

- **Means:** you mixed units without an explicit conversion.
- **Fix:** normalize units at the source, or add an `assertMatchingUnits` call where the
  values enter your system.

### Divide by zero

```
css-calipers.Measurement.divide: Cannot divide 10px by zero [code=CALIPERS_E_DIVIDE_BY_ZERO]
```

- **Means:** you attempted to divide by zero in a measurement operation.
- **Fix:** guard inputs before dividing or replace zero with a safe fallback.

### Clamp bounds

```
css-calipers.Measurement.clamp: clamp: min (20px) must be <= max (12px) [code=CALIPERS_E_CLAMP_INVALID_RANGE]
```

- **Means:** the clamp minimum is greater than the clamp maximum.
- **Fix:** ensure min and max come from the same source or swap them before calling clamp.

### Value constraint

```
css-calipers.refinement.ensure: expected a measurement >= 0 (got -4px) [code=CALIPERS_E_CONSTRAINT]
```

- **Means:** a value-hardening refinement (`nonNegative`, `nonPositive`, `inRange`) rejected
  a value. See [Value hardening](./hardening.md).
- **Fix:** use `is` / `check` / `hardenWith` instead of `ensure` when the value may be
  invalid and you want to branch or fall back rather than throw.

## Stack hints and configuration

For `m` and the unit helpers, errors include a trimmed stack hint in non-production by
default. You can disable or force stack hints globally:

```ts
import { setErrorConfig } from "@css-bookends/css-calipers";

// Disable stack hints everywhere (for production).
setErrorConfig({ stackHints: "off" });

// Force stack hints everywhere (useful in dev or tests).
setErrorConfig({ stackHints: "on" });
```

For instance-scoped configuration, use the [factory entrypoint](../README.md#factory-entrypoint-optional).
