import { IContainerQueries, IContainerQueryStyles } from "../containerQueries";

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
  const emitDimensionsFeatures = createEmitDimensionsFeatures(validation);
  const emitResolutionFeatures = createEmitResolutionFeatures(validation);

  const emitBaseFeatures = (
    props: IContainerQueryProps,
    helpers: ContainerQueryBuilderHelpers
  ): void => {
    emitCoreFeatures(props, helpers);
    emitAspectRatioFeatures(props, helpers);
    emitBlockSizeFeatures(props, helpers);
    emitInlineSizeFeatures(props, helpers);
    emitResolutionFeatures(props, helpers);
    emitInteractionFeatures(props, helpers);
    emitPreferencesFeatures(props, helpers);
    emitDisplayFeatures(props, helpers);
    emitEnvironmentFeatures(props, helpers);
    emitCustomFeatures(props, helpers);
  };

  const buildContainerQueryString = createContainerQueryBuilder({
    emitBase: emitBaseFeatures,
    resolveType: (props: IContainerQueryProps) => props.type,
  });

  const makeContainerQueryStyle =
    <T extends IContainerQueries>(queries: T) =>
    (stylesByQuery: IContainerQueryStyles<T>): ComplexStyleRule => {
      const result: Record<string, StyleRule> = {};

      (Object.keys(stylesByQuery) as (keyof T)[]).forEach((key) => {
        const styles = stylesByQuery[key];
        const props = queries[key];
        if (!styles || !props) return;
        result[buildContainerQueryString(props)] = styles;
      });

      const ContainerQuery: ComplexStyleRule = {
        "@Container": result,
      };
      return ContainerQuery;
    };

  const moduleEmitters: ContainerQueryModuleEmitters = {
    core: emitCoreFeatures,
    dimensions: emitDimensionsFeatures,
    resolution: emitResolutionFeatures,
    interaction: emitInteractionFeatures,
    preferences: emitPreferencesFeatures,
    display: emitDisplayFeatures,
    environment: emitEnvironmentFeatures,
    custom: emitCustomFeatures,
  };

  const ContainerQueryFactory = createContainerQueryFactory(moduleEmitters);

  return {
    buildContainerQueryString,
    makeContainerQueryStyle,
    ContainerQueryFactory,
    emitCoreFeatures,
    emitDimensionsFeatures,
    emitResolutionFeatures,
    emitInteractionFeatures,
    emitPreferencesFeatures,
    emitDisplayFeatures,
    emitEnvironmentFeatures,
    emitCustomFeatures,
    ContainerQueryOutputVanillaExtract,
    createContainerQueryBuilder,
  } as const;
};

export type ContainerQueriesApi = ReturnType<typeof createContainerQueriesApi>;
export type {
  IContainerQueries,
  IContainerQueryProps,
  IContainerQueryStyles,
  IContainerQueryCustomFeatures,
  IContainerQueryDimensions,
  IContainerQueryResolutionRange,
  IContainerQueryInteraction,
  IContainerQueryPreferences,
  IContainerQueryDisplay,
  IContainerQueryEnvironment,
  ContainerQueryFactoryConfig,
  ContainerQueryModulesList,
};
