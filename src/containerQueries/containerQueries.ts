import { IMeasurement } from "../core";
import type { ComplexStyleRule, StyleRule } from "../mediaQueries/types";
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

export interface IContainerQueryProps extends
    IContainerQueryExact,
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

export interface IContainerQuery {
  props: IContainerQueryProps;
  styles: StyleRule;
}

export type IContainerQueries = Record<string, IContainerQueryProps>;

export type IContainerQueryStyles<T extends IContainerQueries> = Partial<
  Record<keyof T, StyleRule>
>;

export const createEmitCoreFeatures = (
  validation: ContainerQueryValidation,
) => (
  props: IContainerQueryCore,
  helpers: ContainerQueryBuilderHelpers,
): void => {
  // const {
  //   // TODO
  // } = validation;

  // if (
  //   !runMediaQueryValidation(
  //     props,
  //     helpers,
  //     validateMinMaxWidth,
  //     "core",
  //     "minWidth must be less than or equal to maxWidth"
  //   )
  // ) {
  //   return;
  // }
  // if (
  //   !runMediaQueryValidation(
  //     props,
  //     helpers,
  //     validateWidthValuesPositive,
  //     "core",
  //     "width values must be greater than 0"
  //   )
  // ) {
  //   return;
  // }
  // const { addFeature } = helpers;

  // if (props.minWidth) {
  //   addFeature("min-width", props.minWidth);
  // }
  // if (props.maxWidth) {
  //   addFeature("max-width", props.maxWidth);
  // }
};

export const emitCoreFeatures = createEmitCoreFeatures(
  defaultMediaQueryValidation,
);

const emitBaseFeatures = (
  props: IMediaQueryProps,
  helpers: MediaQueryBuilderHelpers
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
