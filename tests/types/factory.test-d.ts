import { expectAssignable } from 'tsd';

import {
  createCalipers,
  type CalipersFactoryConfig,
  type CalipersInstance,
} from '../../dist/esm/factory';

const config: CalipersFactoryConfig = {
  errorConfig: { stackHints: 'on' },
};

const instance = createCalipers(config);
expectAssignable<CalipersInstance>(instance);

instance.m(10);
instance.mPx(2);
instance.units.mPx(3);
