import { IMeasurement } from "../core";
import type { Comparison, IComparisonOperator } from "../comparisons";
import type {
  emitContainerQueryValue,
  emitContainerQueryBlock,
  emitContainerQueryInline,
  emitContainerQueryOrientation,
  emitContainerQueryRange,
  IContainerQueryBlock,
  IContainerQueryExact,
  IContainerQueryInline,
  IContainerQueryOrientation,
  IContainerQueryRange,
} from "./modules";
import { ContainerQueryValidation } from "./validation";
import { ContainerQueryBuilderHelpers } from "./helpers";
import { defaultMediaQueryValidation } from "../mediaQueries/validation";
import { StyleRule } from "../mediaQueries";

export interface IContainerQueryProps
  extends IContainerQueryExact,
    IContainerQueryRange,
    IContainerQueryInline,
    IContainerQueryBlock,
    IContainerQueryOrientation {}

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
  defaultMediaQueryValidation
);

const emitBaseFeatures = (
  props: IContainerQueryCore,
  helpers: ContainerQueryBuilderHelpers
): void => {
  emitCoreFeatures(props, helpers);
  emitContainerQueryValue(props, helpers);
  emitContainerQueryRange(props, helpers);
  emitContainerQueryInline(props, helpers);
  emitContainerQueryBlock(props, helpers);
  emitContainerQueryOrientation(props, helpers);
};

export const buildContainerQueryString = createContainerQueryBuilder({
  emitBase: emitBaseFeatures,
  resolveType: (props) => props.type,
});

export const makeContainerQueryStyle =
  <T extends IContainerQueries>(queries: T) =>
  (stylesByQuery: IContainerQueryStyles<T>): ComplexStyleRule => {
    const result: Record<string, StyleRule> = {};

    (Object.keys(stylesByQuery) as (keyof T)[]).forEach((key) => {
      const styles = stylesByQuery[key];
      const props = queries[key];
      if (!styles || !props) return;
      result[buildContainerQueryString(props)] = styles;
    });

    const containerQuery: ComplexStyleRule = {
      "@container": result,
    };
    return containerQuery;
  };
