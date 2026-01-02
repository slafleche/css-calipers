import { runMediaQueryTests } from './mediaQueries.shared';

const mediaQueriesModule = await import(
  '../../../dist/esm/mediaQueries/index.js'
);
const coreModule = await import('../../../dist/esm/index.js');

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

runMediaQueryTests('esm', {
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
