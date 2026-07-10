import { describe, expect, it } from 'vitest';

import {
  assertCondition,
  assertUnit,
  color,
  inRange,
  m,
  makeUnitAssert,
  mPx,
  nonNegative,
} from '../../../src/index';
import type { ErrorCode } from '../../../src/internal/errors';

/*
 * Publish-readiness: ERROR-CODE CONSISTENCY.
 *
 * The package has two intentional error tiers:
 *   1. The MEASUREMENT CORE carries machine-readable `CALIPERS_E_*` codes in the
 *      error message (`[code=...]`). Every code in the `ErrorCode` union is
 *      reachable and documented in docs/errors.md.
 *   2. The SCALAR (i/f/r) and COLOUR layers throw plain `Error` messages
 *      WITHOUT a code. This test pins that boundary so a future change that adds
 *      or moves a code is a deliberate, visible edit.
 */

const messageOf = (fn: () => unknown): string => {
  try {
    fn();
  } catch (err) {
    return (err as Error).message;
  }
  throw new Error('expected the call to throw');
};

describe('every CALIPERS_E_* code in the union is reachable', () => {
  // One concrete throw site per code. Keeping this exhaustive means a newly
  // added code without a throw site (or a renamed code) breaks the build.
  const cases: Array<
    [
      ErrorCode,
      () => unknown,
    ]
  > = [
    [
      'CALIPERS_E_NONFINITE',
      () => m(Number.NaN, 'px'),
    ],
    [
      'CALIPERS_E_UNIT_MISMATCH',
      () =>
        m(1, 'px').add(
          m(1, 'em') as unknown as ReturnType<typeof mPx>,
        ),
    ],
    [
      'CALIPERS_E_ASSERT_UNIT',
      () => assertUnit(m(1, 'px'), 'em'),
    ],
    [
      'CALIPERS_E_ASSERT_CONDITION',
      () => assertCondition(false, 'nope'),
    ],
    [
      'CALIPERS_E_ASSERT_PREDICATE',
      () => m(1, 'px').assert(() => false, 'predicate failed'),
    ],
    [
      'CALIPERS_E_CONSTRAINT',
      () => nonNegative.ensure(m(-1, 'px')),
    ],
    [
      'CALIPERS_E_DIVIDE_BY_ZERO',
      () => m(1, 'px').divide(0),
    ],
    [
      'CALIPERS_E_NONFINITE_RESULT',
      // divide produces a non-finite result without dividing by zero:
      // a tiny divisor against a huge value overflows to Infinity.
      () => m(1e308, 'px').divide(1e-308),
    ],
    [
      'CALIPERS_E_CLAMP_NONFINITE_BOUNDS',
      () =>
        m(1, 'px').clamp(
          m(0, 'px'),
          // forge a non-finite bound past the constructor via a fake measurement
          {
            getUnit: () => 'px',
            getValue: () => Number.POSITIVE_INFINITY,
            css: () => 'Infinitypx',
          } as unknown as ReturnType<typeof mPx>,
        ),
    ],
    [
      'CALIPERS_E_CLAMP_INVALID_RANGE',
      () => m(1, 'px').clamp(m(10, 'px'), m(0, 'px')),
    ],
  ];

  it.each(cases)('%s is emitted by its throw site', (code, fn) => {
    expect(messageOf(fn)).toContain(`code=${code}`);
  });
});

describe('makeUnitAssert emits the assert-unit code', () => {
  it('throws CALIPERS_E_ASSERT_UNIT for a wrong unit', () => {
    const assertPx = makeUnitAssert(mPx);
    expect(messageOf(() => assertPx(m(1, 'em')))).toContain(
      'code=CALIPERS_E_ASSERT_UNIT',
    );
  });
});

describe('the scalar / colour layers throw codeless messages', () => {
  it('colour bad input is codeless with a color: prefix', () => {
    const msg = messageOf(() => color('definitely-not-a-color'));
    expect(msg).toMatch(/^color:/);
    expect(msg).not.toMatch(/CALIPERS_E_/);
  });

  it('inRange construction error is a plain message', () => {
    const msg = messageOf(() => inRange(10, 0));
    expect(msg).toMatch(/min .* must be <= max/);
  });
});
