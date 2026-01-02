import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

import type { IMeasurement } from '../../dist/esm';
import { m, mDpi, mPx, r } from '../../dist/esm';
import {
  buildMediaQueryFromFeatures,
  buildMediaQueryString,
  createMediaQueryBuilder,
  defineMediaQueryModules,
  emitDimensionsFeatures,
  mediaQueryFactory,
} from '../../dist/esm/mediaQueries';
import type { MediaQueryModulePropsMap } from '../../dist/esm/mediaQueries';
import type { IMediaQueryProps } from '../../dist/esm/mediaQueries';

const width = mPx(640);
expectAssignable<IMeasurement<'px'>>(width);

const query = buildMediaQueryString({
  minWidth: width,
  maxWidth: mPx(1200),
  orientation: 'landscape',
});
expectType<string>(query);

const customQuery = buildMediaQueryFromFeatures({
  'min-width': width,
  'custom-level': 2,
});
expectType<string>(customQuery);

const builder = createMediaQueryBuilder({
  emitBase: emitDimensionsFeatures,
  config: {
    errorHandling: {
      invalidValueMode: 'log',
      lintingMode: 'allow',
    },
  },
});

expectType<string>(builder({ width }));

expectNotAssignable<MediaQueryModulePropsMap['dimensions']>({
  aspectRatio: m('16/9'),
});

expectAssignable<IMediaQueryProps>({ minWidth: mPx(320) });
expectAssignable<IMediaQueryProps>({ maxWidth: mPx(1024) });
expectAssignable<IMediaQueryProps>({ width: mPx(720) });
expectAssignable<IMediaQueryProps>({ minHeight: mPx(480) });
expectAssignable<IMediaQueryProps>({ maxHeight: mPx(900) });
expectAssignable<IMediaQueryProps>({ height: mPx(600) });
expectAssignable<IMediaQueryProps>({ aspectRatio: r(16, 9) });
expectAssignable<IMediaQueryProps>({ minAspectRatio: r(4, 3) });
expectAssignable<IMediaQueryProps>({ maxAspectRatio: r(21, 9) });
expectAssignable<IMediaQueryProps>({ resolutionValue: mDpi(144) });
expectAssignable<IMediaQueryProps>({ minResolution: mDpi(96) });
expectAssignable<IMediaQueryProps>({ maxResolution: mDpi(192) });
expectAssignable<IMediaQueryProps>({
  customFeatures: { 'custom-flag': 'on' },
});

expectAssignable<IMediaQueryProps>({
  minWidth: [mPx(320), mPx(640)],
});
expectAssignable<IMediaQueryProps>({
  maxWidth: [mPx(1024), mPx(1280)],
});
expectAssignable<IMediaQueryProps>({
  width: [mPx(720), mPx(960)],
});
expectAssignable<IMediaQueryProps>({
  minHeight: [mPx(480), mPx(640)],
});
expectAssignable<IMediaQueryProps>({
  maxHeight: [mPx(900), mPx(1080)],
});
expectAssignable<IMediaQueryProps>({
  height: [mPx(600), mPx(800)],
});
expectAssignable<IMediaQueryProps>({
  aspectRatio: [r(16, 9), r(4, 3)],
});
expectAssignable<IMediaQueryProps>({
  minAspectRatio: [r(4, 3), r(3, 2)],
});
expectAssignable<IMediaQueryProps>({
  maxAspectRatio: [r(21, 9), r(16, 9)],
});
expectAssignable<IMediaQueryProps>({
  resolutionValue: [mDpi(144), mDpi(192)],
});
expectAssignable<IMediaQueryProps>({
  minResolution: [mDpi(96), mDpi(144)],
});
expectAssignable<IMediaQueryProps>({
  maxResolution: [mDpi(192), mDpi(240)],
});
expectAssignable<IMediaQueryProps>({
  customFeatures: { 'custom-flag': ['on', 'off'] },
});

const coreModules = defineMediaQueryModules('core');
type CoreProps = MediaQueryModulePropsMap[(typeof coreModules)[number]];
expectNotAssignable<CoreProps>({ minWidth: width, hover: 'hover' });
const coreFactory = mediaQueryFactory({
  queries: {
    onlyCore: {
      minWidth: width,
    },
  } as Record<string, CoreProps>,
  config: {
    label: 'core-only',
    modules: coreModules,
  },
});
expectAssignable<unknown>(coreFactory);

const customModules = defineMediaQueryModules('custom');
type CustomProps = MediaQueryModulePropsMap[(typeof customModules)[number]];
expectAssignable<CustomProps>({ customFeatures: { 'custom-flag': 'on' } });
expectNotAssignable<CustomProps>({ hover: 'hover' });
const customAllowedFactory = mediaQueryFactory({
  queries: {
    customOk: {
      customFeatures: { 'custom-flag': 'on' },
    },
  } as Record<string, CustomProps>,
  config: {
    label: 'custom-ok',
    modules: customModules,
  },
});
expectAssignable<unknown>(customAllowedFactory);
