import { assertCondition, assertMatchingUnits, IMeasurement } from "../core";
import { ContainerQueryValidationResult } from "./helpers";
import { toValidationResult } from "../validation";

export type ContainerQueryValidationCheck<TConfig> = (config: TConfig) => void;

export type ContainerQueryCoreHelpers = {
  assertCondition: typeof assertCondition;
  assertMatchingUnits: typeof assertMatchingUnits;
};

export type ContainerQueryValidation = ReturnType<
  typeof createContainerQueryValidation
>;

export const createContainerQueryValidation = (
  core: ContainerQueryCoreHelpers,
) => {
  const { assertCondition, assertMatchingUnits } = core;

  const runContainerQueryValidation = <TConfig>(
    config: TConfig,
    helpers: ContainerQueryBuilderHelpers,
    check?: ContainerQueryValidationCheck<TConfig>,
    context?: string,
    fallbackMessage = 'Invalid Container query configuration',
  ): boolean => {
    if (!check) return true;
    try {
      check(config);
      return true;
    } catch (error) {
      const result = toValidationResult(error, fallbackMessage);
      return applyContainerQueryValidation(
        config,
        helpers,
        () => result,
        context,
      );
    }
  };

  const validateMinMaxWidth = (props: IContainerQueryCore): void => {
    if (!props.minWidth || !props.maxWidth) return;
    assertMatchingUnits(
      props.minWidth,
      props.maxWidth,
      'ContainerQueries.minMaxWidth',
    );
    assertCondition(
      props.minWidth.getValue() <= props.maxWidth.getValue(),
      'minWidth must be less than or equal to maxWidth',
    );
  };

  const validateWidthValuesPositive = (
    props: IContainerQueryCore & IContainerQueryDimensions,
  ): void => {
    const assertPositive = (
      value: IMeasurement,
      label: string,
    ): void => {
      assertCondition(
        value.getValue() > 0,
        `${label} must be greater than 0`,
      );
    };

    if (props.width) {
      assertPositive(props.width, 'width');
    }
    if (props.minWidth) {
      assertPositive(props.minWidth, 'minWidth');
    }
    if (props.maxWidth) {
      assertPositive(props.maxWidth, 'maxWidth');
    }
  };

  const validateMinMaxHeight = (
    props: IContainerQueryDimensions,
  ): void => {
    if (!props.minHeight || !props.maxHeight) return;
    assertMatchingUnits(
      props.minHeight,
      props.maxHeight,
      'ContainerQueries.minMaxHeight',
    );
    assertCondition(
      props.minHeight.getValue() <= props.maxHeight.getValue(),
      'minHeight must be less than or equal to maxHeight',
    );
  };

  const validateHeightValuesPositive = (
    props: IContainerQueryDimensions,
  ): void => {
    const assertPositive = (
      value: IMeasurement,
      label: string,
    ): void => {
      assertCondition(
        value.getValue() > 0,
        `${label} must be greater than 0`,
      );
    };

    if (props.height) {
      assertPositive(props.height, 'height');
    }
    if (props.minHeight) {
      assertPositive(props.minHeight, 'minHeight');
    }
    if (props.maxHeight) {
      assertPositive(props.maxHeight, 'maxHeight');
    }
  };

const parseAspectRatio = (
  value: IContainerQueryDimensions['aspectRatio'],
): number | null => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes('/')) {
    const [left, right] = trimmed.split('/');
    if (left === undefined || right === undefined) return null;
    const numerator = Number(left.trim());
    const denominator = Number(right.trim());
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      return null;
    }
    if (denominator === 0) return null;
    return numerator / denominator;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

  const validateMinMaxAspectRatio = (
    props: IContainerQueryDimensions,
  ): void => {
    if (!props.minAspectRatio || !props.maxAspectRatio) return;
    const minRatio = parseAspectRatio(props.minAspectRatio);
    const maxRatio = parseAspectRatio(props.maxAspectRatio);
    assertCondition(
      minRatio !== null && maxRatio !== null,
      'aspectRatio values must be valid numbers or ratio strings',
    );
    assertCondition(
      (minRatio as number) <= (maxRatio as number),
      'minAspectRatio must be less than or equal to maxAspectRatio',
    );
  };

  const validateAspectRatioValuesPositive = (
    props: IContainerQueryDimensions,
  ): void => {
    const assertValidPositive = (
      label: string,
      value: number | null,
    ): void => {
      assertCondition(
        value !== null && value > 0,
        `${label} must be a valid ratio greater than 0`,
      );
    };

    if (props.aspectRatio !== undefined) {
      assertValidPositive(
        'aspectRatio',
        parseAspectRatio(props.aspectRatio),
      );
    }
    if (props.minAspectRatio !== undefined) {
      assertValidPositive(
        'minAspectRatio',
        parseAspectRatio(props.minAspectRatio),
      );
    }
    if (props.maxAspectRatio !== undefined) {
      assertValidPositive(
        'maxAspectRatio',
        parseAspectRatio(props.maxAspectRatio),
      );
    }
  };

  const validateResolutionValues = (
    props: IContainerQueryResolutionRange,
  ): void => {
    const assertPositive = (
      value: IMeasurement,
      label: string,
    ): void => {
      assertCondition(
        value.getValue() > 0,
        `${label} must be greater than 0`,
      );
    };

    if (props.resolutionValue) {
      assertPositive(props.resolutionValue, 'resolution');
    }
    if (props.minResolution) {
      assertPositive(props.minResolution, 'minResolution');
    }
    if (props.maxResolution) {
      assertPositive(props.maxResolution, 'maxResolution');
    }
    if (props.minResolution && props.maxResolution) {
      assertMatchingUnits(
        props.minResolution,
        props.maxResolution,
        'ContainerQueries.resolutionUnits',
      );
    }
  };

  return {
    runContainerQueryValidation,
    validateMinMaxWidth,
    validateWidthValuesPositive,
    validateMinMaxHeight,
    validateHeightValuesPositive,
    validateMinMaxAspectRatio,
    validateAspectRatioValuesPositive,
    validateResolutionValues,
  };
};

const defaultContainerQueryValidation = createContainerQueryValidation({
  assertCondition,
  assertMatchingUnits,
});

export const {
  runContainerQueryValidation,
  validateMinMaxWidth,
  validateWidthValuesPositive,
  validateMinMaxHeight,
  validateHeightValuesPositive,
  validateMinMaxAspectRatio,
  validateAspectRatioValuesPositive,
  validateResolutionValues,
} = defaultContainerQueryValidation;

export { defaultContainerQueryValidation };
