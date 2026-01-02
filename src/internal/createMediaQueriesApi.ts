import type { CoreApi } from "./createCoreApi";
import { createMediaQueryBuilder } from "../mediaQueries/helpers";
import type { StyleRule } from "../mediaQueries/types";
import { createMediaQueryValidation } from "../mediaQueries/validation";
import {
  createEmitCoreFeatures,
  type IMediaQueries,
  type IMediaQueryProps,
  type IMediaQueryStyles,
} from "../mediaQueries/mediaQueries";
import {
  createEmitDimensionsFeatures,
  emitDisplayFeatures,
  emitEnvironmentFeatures,
  emitInteractionFeatures,
  emitPreferencesFeatures,
  emitCustomFeatures,
  type IMediaQueryCustomFeatures,
  type IMediaQueryDimensions,
  type IMediaQueryDisplay,
  type IMediaQueryEnvironment,
  type IMediaQueryInteraction,
  type IMediaQueryPreferences,
} from "../mediaQueries/modules";
import {
  createEmitResolutionFeatures,
  type IMediaQueryResolutionRange,
} from "../mediaQueries/modules/resolution";
import {
  createMediaQueryFactory,
  type MediaQueryFactoryConfig,
  type MediaQueryModuleEmitters,
} from "../mediaQueries/factory";
import { mediaQueryOutputVanillaExtract } from "../libraryHelpers/vanilla-extract";
import type { MediaQueryBuilderHelpers } from "../mediaQueries/helpers";
import type { MediaQueryModulesList } from "../mediaQueries/moduleRegistry";

type MediaQueriesCore = Pick<
  CoreApi,
  "assertCondition" | "assertMatchingUnits"
>;

export const createMediaQueriesApi = (core: MediaQueriesCore) => {
  const validation = createMediaQueryValidation({
    assertCondition: core.assertCondition,
    assertMatchingUnits: core.assertMatchingUnits,
  });

  const emitCoreFeatures = createEmitCoreFeatures(validation);
  const emitDimensionsFeatures = createEmitDimensionsFeatures(validation);
  const emitResolutionFeatures = createEmitResolutionFeatures(validation);

  const emitBaseFeatures = (
    props: IMediaQueryProps,
    helpers: MediaQueryBuilderHelpers
  ): void => {
    emitCoreFeatures(props, helpers);
    emitDimensionsFeatures(props, helpers);
    emitResolutionFeatures(props, helpers);
    emitInteractionFeatures(props, helpers);
    emitPreferencesFeatures(props, helpers);
    emitDisplayFeatures(props, helpers);
    emitEnvironmentFeatures(props, helpers);
    emitCustomFeatures(props, helpers);
  };

  const buildMediaQueryString = createMediaQueryBuilder({
    emitBase: emitBaseFeatures,
    resolveType: (props: IMediaQueryProps) => props.type,
  });

  const makeMediaQueryStyle =
    <T extends IMediaQueries>(queries: T) =>
    (stylesByQuery: IMediaQueryStyles<T>): StyleRule => {
      const result: Record<string, StyleRule> = {};

      (Object.keys(stylesByQuery) as (keyof T)[]).forEach((key) => {
        const styles = stylesByQuery[key];
        const props = queries[key];
        if (!styles || !props) return;
        result[buildMediaQueryString(props)] = styles;
      });

      const mediaQuery: StyleRule = {
        "@media": result,
      };
      return mediaQuery;
    };

  const moduleEmitters: MediaQueryModuleEmitters = {
    core: emitCoreFeatures,
    dimensions: emitDimensionsFeatures,
    resolution: emitResolutionFeatures,
    interaction: emitInteractionFeatures,
    preferences: emitPreferencesFeatures,
    display: emitDisplayFeatures,
    environment: emitEnvironmentFeatures,
    custom: emitCustomFeatures,
  };

  const mediaQueryFactory = createMediaQueryFactory(moduleEmitters);

  return {
    buildMediaQueryString,
    makeMediaQueryStyle,
    mediaQueryFactory,
    emitCoreFeatures,
    emitDimensionsFeatures,
    emitResolutionFeatures,
    emitInteractionFeatures,
    emitPreferencesFeatures,
    emitDisplayFeatures,
    emitEnvironmentFeatures,
    emitCustomFeatures,
    mediaQueryOutputVanillaExtract,
    createMediaQueryBuilder,
  } as const;
};

export type MediaQueriesApi = ReturnType<typeof createMediaQueriesApi>;
export type {
  IMediaQueries,
  IMediaQueryProps,
  IMediaQueryStyles,
  IMediaQueryCustomFeatures,
  IMediaQueryDimensions,
  IMediaQueryResolutionRange,
  IMediaQueryInteraction,
  IMediaQueryPreferences,
  IMediaQueryDisplay,
  IMediaQueryEnvironment,
  MediaQueryFactoryConfig,
  MediaQueryModulesList,
};
