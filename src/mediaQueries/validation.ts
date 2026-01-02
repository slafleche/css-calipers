import type {
  MediaQueryBuilderHelpers,
  MediaQueryValidationResult,
} from "./helpers";
import { applyMediaQueryValidation } from "./helpers";
import {
  assertCondition,
  assertMatchingUnits,
  isRatio,
  ratioToFloat,
} from "../core";
import { normalizeToArray } from "../internal/normalizeToArray";
import type { IMediaQueryCore } from "./mediaQueries";
import type { IMediaQueryDimensions } from "./modules/dimensions";
import type { IMediaQueryResolutionRange } from "./modules/resolution";
import type { IRatio, IMeasurement } from "../core";

export type MediaQueryValidationCheck<TConfig> = (config: TConfig) => void;

export type MediaQueryCoreHelpers = {
  assertCondition: typeof assertCondition;
  assertMatchingUnits: typeof assertMatchingUnits;
};

export type MediaQueryValidation = ReturnType<
  typeof createMediaQueryValidation
>;

const toValidationResult = (
  error: unknown,
  fallback: string
): MediaQueryValidationResult => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const createMediaQueryValidation = (core: MediaQueryCoreHelpers) => {
  const { assertCondition, assertMatchingUnits } = core;

  const runMediaQueryValidation = <TConfig>(
    config: TConfig,
    helpers: MediaQueryBuilderHelpers,
    check?: MediaQueryValidationCheck<TConfig>,
    context?: string,
    fallbackMessage = "Invalid media query configuration"
  ): boolean => {
    if (!check) return true;
    try {
      check(config);
      return true;
    } catch (error) {
      const result = toValidationResult(error, fallbackMessage);
      return applyMediaQueryValidation(config, helpers, () => result, context);
    }
  };

  const validateMinMaxWidth = (props: IMediaQueryCore): void => {
    if (!props.minWidth || !props.maxWidth) return;
    if (Array.isArray(props.minWidth) || Array.isArray(props.maxWidth)) {
      return;
    }
    assertMatchingUnits(
      props.minWidth,
      props.maxWidth,
      "mediaQueries.minMaxWidth"
    );
    assertCondition(
      props.minWidth.getValue() <= props.maxWidth.getValue(),
      "minWidth must be less than or equal to maxWidth"
    );
  };

  const validateWidthValuesPositive = (
    props: IMediaQueryCore & IMediaQueryDimensions
  ): void => {
    const assertPositive = (value: IMeasurement, label: string): void => {
      assertCondition(value.getValue() > 0, `${label} must be greater than 0`);
    };

    normalizeToArray(props.width).forEach((value) => {
      assertPositive(value, "width");
    });
    normalizeToArray(props.minWidth).forEach((value) => {
      assertPositive(value, "minWidth");
    });
    normalizeToArray(props.maxWidth).forEach((value) => {
      assertPositive(value, "maxWidth");
    });
  };

  const validateMinMaxHeight = (props: IMediaQueryDimensions): void => {
    if (!props.minHeight || !props.maxHeight) return;
    if (Array.isArray(props.minHeight) || Array.isArray(props.maxHeight)) {
      return;
    }
    assertMatchingUnits(
      props.minHeight,
      props.maxHeight,
      "mediaQueries.minMaxHeight"
    );
    assertCondition(
      props.minHeight.getValue() <= props.maxHeight.getValue(),
      "minHeight must be less than or equal to maxHeight"
    );
  };

  const validateHeightValuesPositive = (props: IMediaQueryDimensions): void => {
    const assertPositive = (value: IMeasurement, label: string): void => {
      assertCondition(value.getValue() > 0, `${label} must be greater than 0`);
    };

    normalizeToArray(props.height).forEach((value) => {
      assertPositive(value, "height");
    });
    normalizeToArray(props.minHeight).forEach((value) => {
      assertPositive(value, "minHeight");
    });
    normalizeToArray(props.maxHeight).forEach((value) => {
      assertPositive(value, "maxHeight");
    });
  };

  const assertRatio: (
    value: unknown,
    label: string
  ) => asserts value is IRatio = (value, label) => {
    assertCondition(
      isRatio(value),
      `${label} must be a ratio created with r()`
    );
  };

  const assertRatioPositive = (value: IRatio, label: string): void => {
    assertCondition(
      value.numerator() > 0 && value.denominator() > 0,
      `${label} must be a valid ratio greater than 0`
    );
  };

  const validateMinMaxAspectRatio = (props: IMediaQueryDimensions): void => {
    if (!props.minAspectRatio || !props.maxAspectRatio) return;
    if (
      Array.isArray(props.minAspectRatio) ||
      Array.isArray(props.maxAspectRatio)
    ) {
      return;
    }
    assertRatio(props.minAspectRatio, "minAspectRatio");
    assertRatio(props.maxAspectRatio, "maxAspectRatio");
    const minRatio = ratioToFloat(props.minAspectRatio);
    const maxRatio = ratioToFloat(props.maxAspectRatio);
    assertCondition(
      minRatio <= maxRatio,
      "minAspectRatio must be less than or equal to maxAspectRatio"
    );
  };

  const validateAspectRatioValuesPositive = (
    props: IMediaQueryDimensions
  ): void => {
    normalizeToArray(props.aspectRatio).forEach((value) => {
      assertRatio(value, "aspectRatio");
      assertRatioPositive(value, "aspectRatio");
    });
    normalizeToArray(props.minAspectRatio).forEach((value) => {
      assertRatio(value, "minAspectRatio");
      assertRatioPositive(value, "minAspectRatio");
    });
    normalizeToArray(props.maxAspectRatio).forEach((value) => {
      assertRatio(value, "maxAspectRatio");
      assertRatioPositive(value, "maxAspectRatio");
    });
  };

  const validateResolutionValues = (
    props: IMediaQueryResolutionRange
  ): void => {
    const assertPositive = (value: IMeasurement, label: string): void => {
      assertCondition(value.getValue() > 0, `${label} must be greater than 0`);
    };

    normalizeToArray(props.resolutionValue).forEach((value) => {
      assertPositive(value, "resolution");
    });
    normalizeToArray(props.minResolution).forEach((value) => {
      assertPositive(value, "minResolution");
    });
    normalizeToArray(props.maxResolution).forEach((value) => {
      assertPositive(value, "maxResolution");
    });
    if (
      props.minResolution &&
      props.maxResolution &&
      !Array.isArray(props.minResolution) &&
      !Array.isArray(props.maxResolution)
    ) {
      assertMatchingUnits(
        props.minResolution,
        props.maxResolution,
        "mediaQueries.resolutionUnits"
      );
    }
  };

  return {
    runMediaQueryValidation,
    validateMinMaxWidth,
    validateWidthValuesPositive,
    validateMinMaxHeight,
    validateHeightValuesPositive,
    validateMinMaxAspectRatio,
    validateAspectRatioValuesPositive,
    validateResolutionValues,
  };
};

const defaultMediaQueryValidation = createMediaQueryValidation({
  assertCondition,
  assertMatchingUnits,
});

export const {
  runMediaQueryValidation,
  validateMinMaxWidth,
  validateWidthValuesPositive,
  validateMinMaxHeight,
  validateHeightValuesPositive,
  validateMinMaxAspectRatio,
  validateAspectRatioValuesPositive,
  validateResolutionValues,
} = defaultMediaQueryValidation;

export { defaultMediaQueryValidation };
