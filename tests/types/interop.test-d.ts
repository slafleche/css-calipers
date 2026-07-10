import { expectAssignable } from 'tsd';

import {
  f,
  i,
  type IFloat,
  type IInteger,
  type IMeasurement,
  m,
} from '../../dist/esm';

/*
 * #40 typed-scalar interop, at the TYPE level. The runtime tests (in
 * float.src.test.ts / integer.src.test.ts / core.shared.ts) prove the VALUES are
 * right, but a runtime test passes even if `multiply` / `divide` only typed `number`
 * (a typed scalar coerces via `valueOf`). These assertions are what fail to compile
 * if the operand type ever narrows back to `number`: they require the `Scalar`
 * operand (`number | IInteger | IFloat`) to be accepted on each arithmetic method.
 */

// m() accepts a typed integer / float as a multiply / divide operand.
expectAssignable<IMeasurement<'px'>>(m(8, 'px').multiply(i(2)));
expectAssignable<IMeasurement<'px'>>(m(8, 'px').multiply(f(1.5)));
expectAssignable<IMeasurement<'px'>>(m(8, 'px').divide(i(2)));
expectAssignable<IMeasurement<'px'>>(m(8, 'px').divide(f(1.5)));

// i() accepts a typed float operand and stays an IInteger.
expectAssignable<IInteger>(i(4).multiply(f(2)));
expectAssignable<IInteger>(i(4).multiply(i(2)));
// the new .divide on i() accepts the typed scalar.
expectAssignable<IInteger>(i(4).divide(i(2)));
expectAssignable<IInteger>(i(4).divide(f(2)));

// f() accepts a typed integer operand and stays an IFloat.
expectAssignable<IFloat>(f(1.5).multiply(i(2)));
expectAssignable<IFloat>(f(1.5).multiply(f(2)));
// the new .divide on f() accepts the typed scalar.
expectAssignable<IFloat>(f(1.5).divide(i(2)));
expectAssignable<IFloat>(f(1.5).divide(f(2)));
