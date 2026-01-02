import { runMediaQueryTests } from './mediaQueries.shared';

const mediaQueriesModule = await import(
  '../../../dist/cjs/mediaQueries/index.js'
);
const coreModule = await import('../../../dist/cjs/index.js');

const {
  buildMediaQueryFromFeatures,
  buildMediaQueryString,
  createMediaQueryBuilder,
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitResolutionFeatures,
  mediaQueryFactory,
} = mediaQueriesModule;
const { mDpi, mPx, r } = coreModule;

runMediaQueryTests('cjs', {
  buildMediaQueryString,
  buildMediaQueryFromFeatures,
  createMediaQueryBuilder,
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitResolutionFeatures,
  mediaQueryFactory,
  mDpi,
  mPx,
  r,
});
