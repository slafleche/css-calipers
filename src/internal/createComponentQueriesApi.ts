import type { CoreApi } from "./createCoreApi";
import { createContainerQueryBuilder } from "../containerQueries/helpers";
import type { ContainerQueryBuilderHelpers } from "../containerQueries/helpers";
import type { StyleRule } from "../mediaQueries/types";
import { createContainerQueryValidation } from "../containerQueries/validation";
import {
  createEmitCoreFeatures,
  type IContainerQueries,
  type IContainerQueryProps,
  type IContainerQueryStyles,
} from "../containerQueries/containerQueries";
import {
  emitAspectRatioFeatures,
  emitBlockSizeFeatures,
  emitCustomFeatures,
  emitInlineSizeFeatures,
  emitStyleFeatures,
  type IContainerQueryAspectRatio,
  type IContainerQueryBlock,
  type IContainerQueryCustomFeatures,
  type IContainerQueryInline,
  type IContainerQueryStyle,
} from "../containerQueries/modules";
import {
  createContainerQueryFactory,
  type ContainerQueryFactoryConfig,
} from "../containerQueries/factory";
import { containerQueryOutputVanillaExtract } from "../libraryHelpers/vanilla-extract";
import type { ContainerQueryModulesList } from "../containerQueries/moduleRegistry";

type ContainerQueriesCore = Pick<
  CoreApi,
  "assertCondition" | "assertMatchingUnits"
>;

export const createContainerQueriesApi = (core: ContainerQueriesCore) => {
  const validation = createContainerQueryValidation({
    assertCondition: core.assertCondition,
    assertMatchingUnits: core.assertMatchingUnits,
  });

  const emitCoreFeatures = createEmitCoreFeatures(validation);

  const emitBaseFeatures = (
    props: IContainerQueryProps,
    helpers: ContainerQueryBuilderHelpers
  ): void => {
    emitCoreFeatures(props, helpers);
    emitAspectRatioFeatures(props, helpers);
    emitBlockSizeFeatures(props, helpers);
    emitInlineSizeFeatures(props, helpers);
    emitStyleFeatures(props, helpers);
    emitCustomFeatures(props, helpers);
  };

  const buildContainerQueryString = createContainerQueryBuilder({
    emitBase: emitBaseFeatures,
  });

  const makeContainerQueryStyle =
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

  const containerQueryFactory = createContainerQueryFactory();

  return {
    buildContainerQueryString,
    makeContainerQueryStyle,
    containerQueryFactory,
    emitCoreFeatures,
    emitAspectRatioFeatures,
    emitBlockSizeFeatures,
    emitInlineSizeFeatures,
    emitStyleFeatures,
    emitCustomFeatures,
    containerQueryOutputVanillaExtract,
    createContainerQueryBuilder,
  } as const;
};

export type ContainerQueriesApi = ReturnType<typeof createContainerQueriesApi>;
export type {
  IContainerQueries,
  IContainerQueryProps,
  IContainerQueryStyles,
  IContainerQueryCustomFeatures,
  IContainerQueryAspectRatio,
  IContainerQueryBlock,
  IContainerQueryInline,
  IContainerQueryStyle,
  ContainerQueryFactoryConfig,
  ContainerQueryModulesList,
};
