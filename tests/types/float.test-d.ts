import { expectAssignable, expectError } from 'tsd';

import { f, hardenFloat, type IFloat, isFloat } from '../../dist/esm';

const n = f(0.5);
expectAssignable<IFloat>(n);
expectAssignable<string>(n.css());
expectAssignable<number>(n.value());
expectAssignable<IFloat>(n.add(0.1));
expectAssignable<IFloat>(n.add(f(0.1)));
expectAssignable<IFloat>(n.withValue(0.25));
expectAssignable<IFloat>(n.clamp(0, 1));
expectAssignable<IFloat>(f(0.5, { min: 0, max: 1 }));

const opacity = hardenFloat({ min: 0, max: 1 });
expectAssignable<IFloat>(opacity(0.25));

const u: unknown = f(0.5);
if (isFloat(u)) {
  expectAssignable<IFloat>(u);
}

// the value must be a number
expectError(f('0.5'));
// options only accept the known constraint keys
expectError(f(0.5, { nope: true }));
