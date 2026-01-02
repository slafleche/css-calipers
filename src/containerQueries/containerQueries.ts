import { IMeasurement } from "../core";
import type { Comparison, IComparisonOperator } from "../comparisons";
import type {
  IContainerQueryAspectRatio,
  IContainerQueryBlock,
  IContainerQueryCustomFeatures,
  IContainerQueryInline,
  IContainerQueryStyle,
} from "./modules";
import {
  emitAspectRatioFeatures,
  emitBlockSizeFeatures,
  emitCustomFeatures,
  emitInlineSizeFeatures,
  emitStyleFeatures,
} from "./modules";
import { runContainerQueryLint } from "./linting";
import {
  lintHeightExactRedundancy,
  lintWidthExactRedundancy,
} from "./linting/core";
import { ContainerQueryValidation, defaultContainerQueryValidation } from "./validation";
import { ContainerQueryBuilderHelpers, createContainerQueryBuilder } from "./helpers";
import type { StyleRule } from "../mediaQueries/types";
import type { CSSContainerCondition } from "./types";

export interface IContainerQueryProps
  extends IContainerQueryCore,
    IContainerQueryInline,
    IContainerQueryBlock,
    IContainerQueryAspectRatio,
    IContainerQueryStyle,
    IContainerQueryCustomFeatures {}

export interface IContainerQueryCore {
  minWidth?: IMeasurement;
  maxWidth?: IMeasurement;
  minHeight?: IMeasurement;
  maxHeight?: IMeasurement;
}

export type IContainerQueryCoreVariables =
  | IContainerQueryCore["minWidth"]
  | IContainerQueryCore["maxWidth"]
  | IContainerQueryCore["minHeight"]
  | IContainerQueryCore["maxHeight"];

export type SizeComparisonValue = IMeasurement | string | number;

export type CoreComparisonVariable =
  | "minWidth"
  | "maxWidth"
  | "minHeight"
  | "maxHeight";

export type CoreComparison = Comparison<CoreComparisonVariable, IMeasurement>;

export type CoreComparisonBlock<
  Variable = CoreComparisonVariable,
  Value = IMeasurement
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};

export interface IContainerQuery {
  props: IContainerQueryProps;
  styles: StyleRule;
}

export type IContainerQueries = Record<string, IContainerQueryProps>;

export type IContainerQueryStyles<T extends IContainerQueries> = Partial<
  Record<keyof T, StyleRule>
>;

export const createEmitCoreFeatures =
  (validation: ContainerQueryValidation) =>
  (props: IContainerQueryCore, helpers: ContainerQueryBuilderHelpers): void => {
    const {
      runContainerQueryValidation,
      validateMinMaxWidth,
      validateWidthValuesPositive,
      validateMinMaxHeight,
      validateHeightValuesPositive,
    } = validation;

    if (
      !runContainerQueryValidation(
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
      !runContainerQueryValidation(
        props,
        helpers,
        validateMinMaxHeight,
        "core",
        "minHeight must be less than or equal to maxHeight"
      )
    ) {
      return;
    }
    if (
      !runContainerQueryValidation(
        props,
        helpers,
        validateWidthValuesPositive,
        "core",
        "width values must be greater than 0"
      )
    ) {
      return;
    }
    if (
      !runContainerQueryValidation(
        props,
        helpers,
        validateHeightValuesPositive,
        "core",
        "height values must be greater than 0"
      )
    ) {
      return;
    }
    if (
      !runContainerQueryLint(
        props,
        helpers,
        lintWidthExactRedundancy,
        "minWidth should not be combined with maxWidth when both are equal",
      )
    ) {
      return;
    }
    if (
      !runContainerQueryLint(
        props,
        helpers,
        lintHeightExactRedundancy,
        "minHeight should not be combined with maxHeight when both are equal",
      )
    ) {
      return;
    }

    const { addFeature } = helpers;

    if (props.minWidth) {
      addFeature("min-width", props.minWidth);
    }
    if (props.maxWidth) {
      addFeature("max-width", props.maxWidth);
    }
    if (props.minHeight) {
      addFeature("min-height", props.minHeight);
    }
    if (props.maxHeight) {
      addFeature("max-height", props.maxHeight);
    }
  };

export const emitCoreFeatures = createEmitCoreFeatures(
  defaultContainerQueryValidation
);

const emitBaseFeatures = (
  props: IContainerQueryProps,
  helpers: ContainerQueryBuilderHelpers
): void => {
  emitCoreFeatures(props, helpers);
  emitAspectRatioFeatures(props, helpers);
  emitInlineSizeFeatures(props, helpers);
  emitBlockSizeFeatures(props, helpers);
  emitStyleFeatures(props, helpers);
  emitCustomFeatures(props, helpers);
};

export const buildContainerQueryString = createContainerQueryBuilder({
  emitBase: emitBaseFeatures,
});

const wrapContainerCondition = (value: string): string => {
  const trimmed = value.trim();
  if (
    trimmed.includes(" and ") ||
    trimmed.includes(" or ") ||
    trimmed.startsWith("not ")
  ) {
    return `(${trimmed})`;
  }
  return trimmed;
};

export const buildContainerConditionString = (
  condition: CSSContainerCondition,
): string => {
  if ("and" in condition) {
    return condition.and
      .map((entry) => wrapContainerCondition(buildContainerConditionString(entry)))
      .join(" and ");
  }
  if ("or" in condition) {
    return condition.or
      .map((entry) => wrapContainerCondition(buildContainerConditionString(entry)))
      .join(" or ");
  }
  if ("not" in condition) {
    return `not ${wrapContainerCondition(buildContainerConditionString(condition.not))}`;
  }
  return buildContainerQueryString(condition as IContainerQueryProps);
};

export const makeContainerQueryStyle =
  <T extends IContainerQueries>(queries: T) =>
  (stylesByQuery: IContainerQueryStyles<T>): StyleRule => {
    const result: Record<string, StyleRule> = {};

    (Object.keys(stylesByQuery) as (keyof T)[]).forEach((key) => {
      const styles = stylesByQuery[key];
      const props = queries[key];
      if (!styles || !props) return;
      result[buildContainerQueryString(props)] = styles;
    });

    const containerQuery: StyleRule = {
      "@container": result,
    };
    return containerQuery;
  };
