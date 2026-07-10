import { expectAssignable, expectError } from 'tsd';

import {
  hardenInteger,
  i,
  type IInteger,
  isInteger,
} from '../../dist/esm';

const n = i(5);
expectAssignable<IInteger>(n);
expectAssignable<string>(n.css());
expectAssignable<number>(n.value());
expectAssignable<IInteger>(n.add(2));
expectAssignable<IInteger>(n.add(i(1)));
expectAssignable<IInteger>(n.withValue(3));
expectAssignable<IInteger>(n.clamp(0, 10));
expectAssignable<IInteger>(i(5, { min: 0, max: 10 }));

const bounded = hardenInteger({ min: 1, max: 1000 });
expectAssignable<IInteger>(bounded(700));

const u: unknown = i(5);
if (isInteger(u)) {
  expectAssignable<IInteger>(u);
}

// the value must be a number
expectError(i('5'));
// options only accept the known constraint keys
expectError(i(5, { nope: true }));
