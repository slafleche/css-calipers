import type { IMeasurement } from "../core";
import type { StyleRule } from "./types";
import type { MediaQueryBuilderHelpers } from "./helpers";
import {
  defaultMediaQueryValidation,
  type MediaQueryValidation,
} from "./validation";
import {
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitDisplayFeatures,
  emitEnvironmentFeatures,
  emitInteractionFeatures,
  emitPreferencesFeatures,
  emitResolutionFeatures,
  IMediaQueryCustomFeatures,
  IMediaQueryDimensions,
  IMediaQueryDisplay,
  IMediaQueryEnvironment,
  IMediaQueryInteraction,
  IMediaQueryPreferences,
  IMediaQueryResolutionRange,
} from "./modules";
import {
  buildMediaQueryStringFromLogical,
  createMediaQueryConditionBuilder,
  type MediaQueryLogicalOperator,
  type MediaQueryLogicalRoot,
  type MediaQueryLogicalTarget,
} from "./logical";
import { MEDIA_QUERY_FEATURE_KEYS } from "./featureKeys";

export interface IMediaQueryProps
  extends IMediaQueryCore,
    IMediaQueryDimensions,
    IMediaQueryResolutionRange,
    IMediaQueryInteraction,
    IMediaQueryPreferences,
    IMediaQueryDisplay,
    IMediaQueryEnvironment,
    IMediaQueryCustomFeatures {}

export type IMediaQueryLogicalProps = IMediaQueryProps &
  MediaQueryLogicalOperator<IMediaQueryProps>;

export type IMediaQueryRootProps = MediaQueryLogicalRoot<IMediaQueryProps>;

export type IMediaQueryLogicalTarget = MediaQueryLogicalTarget<IMediaQueryProps>;

export interface IMediaQueryCore {
  type?: "all" | "print" | "screen";
  minWidth?: IMeasurement | IMeasurement[];
  maxWidth?: IMeasurement | IMeasurement[];
}

export interface IMediaQuery {
  props: IMediaQueryLogicalProps;
  styles: StyleRule;
}

export type IMediaQueries = Record<string, IMediaQueryLogicalProps>;

export type IMediaQueryStyles<T extends IMediaQueries> = Partial<
  Record<keyof T, StyleRule>
>;

export const createEmitCoreFeatures = (
  validation: MediaQueryValidation,
) => (
  props: IMediaQueryCore,
  helpers: MediaQueryBuilderHelpers,
): void => {
  const allowQueryArrays = helpers.config.allowQueryArrays !== false;
  const assertNoArray = (value: unknown, label: string): void => {
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(`${label} does not allow arrays.`);
    }
  };
  const emitFeature = (name: string, value: IMeasurement | IMeasurement[]): void => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        (helpers.addFeatureUnsafe ?? helpers.addFeature)(name, entry);
      });
      return;
    }
    helpers.addFeature(name, value);
  };

  const {
    runMediaQueryValidation,
    validateMinMaxWidth,
    validateWidthValuesPositive,
  } = validation;

  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateMinMaxWidth,
      "core",
      "minWidth must be less than or equal to maxWidth"
    )
  ) {
    return;
  }
  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateWidthValuesPositive,
      "core",
      "width values must be greater than 0"
    )
  ) {
    return;
  }
  if (props.minWidth !== undefined) {
    assertNoArray(props.minWidth, "minWidth");
    emitFeature("min-width", props.minWidth);
  }
  if (props.maxWidth !== undefined) {
    assertNoArray(props.maxWidth, "maxWidth");
    emitFeature("max-width", props.maxWidth);
  }
};

export const emitCoreFeatures = createEmitCoreFeatures(
  defaultMediaQueryValidation,
);

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

const MEDIA_QUERY_FEATURE_KEY_SET = new Set<string>(MEDIA_QUERY_FEATURE_KEYS);
const buildBaseCondition = createMediaQueryConditionBuilder({
  emitBase: emitBaseFeatures,
});

export const buildMediaQueryStringWithLogical = (
  props: MediaQueryLogicalRoot<IMediaQueryProps>,
): string => {
  return buildMediaQueryStringFromLogical(props, {
    buildBaseCondition,
    resolveType: (input) => input.type,
    featureKeys: MEDIA_QUERY_FEATURE_KEY_SET,
  });
};

export const buildMediaQueryLogicalString = buildMediaQueryStringWithLogical;

export const buildMediaQueryString = (
  props: IMediaQueryLogicalProps,
): string => buildMediaQueryStringWithLogical(props);

export const makeMediaQueryStyle =
  <T extends IMediaQueries>(queries: T) =>
  (stylesByQuery: IMediaQueryStyles<T>): StyleRule => {
    const result: Record<string, StyleRule> = {};

    (Object.keys(stylesByQuery) as (keyof T)[]).forEach((key) => {
      const styles = stylesByQuery[key];
      const props = queries[key];
      if (!styles || !props) return;
      result[buildMediaQueryStringWithLogical(props)] = styles;
    });

    const mediaQuery: StyleRule = {
      "@media": result,
    };
    return mediaQuery;
  };
