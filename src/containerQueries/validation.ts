import type { ContainerQueryBuilderHelpers } from "./helpers";
import { applyContainerQueryValidation } from "./helpers";
import {
  assertCondition,
  assertMatchingUnits,
  hasCssMethod,
  isMeasurement,
  type IRatio,
  type IMeasurement,
  isRatio,
} from "../core";
import { toValidationResult } from "../validation";
import { normalizeToArray } from "../internal/normalizeToArray";
import type { IContainerQueryCore } from "./containerQueries";
import type { IContainerQueryBlock } from "./modules/block";
import type { IContainerQueryCustomFeatures } from "./modules/custom";
import type { IContainerQueryInline } from "./modules/inline";
import type { IContainerQueryAspectRatio } from "./modules/aspectRatio";
import type { IContainerQueryStyle } from "./modules/style";
import { ratioToFloat } from "../ratio";

export type ContainerQueryValidationCheck<TConfig> = (config: TConfig) => void;

export type ContainerQueryCoreHelpers = {
  assertCondition: typeof assertCondition;
  assertMatchingUnits: typeof assertMatchingUnits;
};

export type ContainerQueryValidation = ReturnType<
  typeof createContainerQueryValidation
>;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const assertMeasurement: (
  value: unknown,
  label: string
) => asserts value is IMeasurement = (value, label) => {
  assertCondition(isMeasurement(value), `${label} must be a measurement`);
};

const assertMeasurementPositive = (
  value: IMeasurement,
  label: string
): void => {
  assertCondition(value.getValue() > 0, `${label} must be greater than 0`);
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
    value.numerator() > 0,
    `${label} numerator must be greater than 0`
  );
  assertCondition(
    value.denominator() > 0,
    `${label} denominator must be greater than 0`
  );
};

const isStyleValue = (value: unknown): boolean => {
  if (typeof value === "string") return true;
  if (isFiniteNumber(value)) return true;
  if (hasCssMethod(value)) return true;
  return false;
};

export const createContainerQueryValidation = (
  core: ContainerQueryCoreHelpers
) => {
  const assertCondition: ContainerQueryCoreHelpers["assertCondition"] =
    core.assertCondition;
  const assertMatchingUnits: ContainerQueryCoreHelpers["assertMatchingUnits"] =
    core.assertMatchingUnits;

  const runContainerQueryValidation = <TConfig>(
    config: TConfig,
    helpers: ContainerQueryBuilderHelpers,
    check?: ContainerQueryValidationCheck<TConfig>,
    context?: string,
    fallbackMessage = "Invalid container query configuration"
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
        context
      );
    }
  };

  const validateMinMaxWidth = (props: IContainerQueryCore): void => {
    if (!props.minWidth || !props.maxWidth) return;
    if (Array.isArray(props.minWidth) || Array.isArray(props.maxWidth)) {
      return;
    }
    assertMatchingUnits(
      props.minWidth,
      props.maxWidth,
      "containerQueries.minMaxWidth"
    );
    assertCondition(
      props.minWidth.getValue() <= props.maxWidth.getValue(),
      "minWidth must be less than or equal to maxWidth"
    );
  };

  const validateWidthValuesPositive = (props: IContainerQueryCore): void => {
    normalizeToArray(props.minWidth).forEach((value) => {
      assertMeasurement(value, "minWidth");
      assertMeasurementPositive(value, "minWidth");
    });
    normalizeToArray(props.maxWidth).forEach((value) => {
      assertMeasurement(value, "maxWidth");
      assertMeasurementPositive(value, "maxWidth");
    });
  };

  const validateMinMaxHeight = (props: IContainerQueryCore): void => {
    if (!props.minHeight || !props.maxHeight) return;
    if (Array.isArray(props.minHeight) || Array.isArray(props.maxHeight)) {
      return;
    }
    assertMatchingUnits(
      props.minHeight,
      props.maxHeight,
      "containerQueries.minMaxHeight"
    );
    assertCondition(
      props.minHeight.getValue() <= props.maxHeight.getValue(),
      "minHeight must be less than or equal to maxHeight"
    );
  };

  const validateHeightValuesPositive = (props: IContainerQueryCore): void => {
    normalizeToArray(props.minHeight).forEach((value) => {
      assertMeasurement(value, "minHeight");
      assertMeasurementPositive(value, "minHeight");
    });
    normalizeToArray(props.maxHeight).forEach((value) => {
      assertMeasurement(value, "maxHeight");
      assertMeasurementPositive(value, "maxHeight");
    });
  };

  const validateInlineSizeValues = (props: IContainerQueryInline): void => {
    normalizeToArray(props.inlineSize).forEach((value) => {
      assertMeasurement(value.value, "inlineSize");
      assertMeasurementPositive(value.value, "inlineSize");
    });
    normalizeToArray(props.inlineSizeRange).forEach((value) => {
      assertMeasurement(value.min, "inlineSizeRange.min");
      assertMeasurement(value.max, "inlineSizeRange.max");
      assertMeasurementPositive(value.min, "inlineSizeRange.min");
      assertMeasurementPositive(value.max, "inlineSizeRange.max");
      assertMatchingUnits(
        value.min,
        value.max,
        "containerQueries.inlineSizeRangeUnits"
      );
      assertCondition(
        value.min.getValue() <= value.max.getValue(),
        "inlineSizeRange min must be less than or equal to max"
      );
    });
  };

  const validateBlockSizeValues = (props: IContainerQueryBlock): void => {
    normalizeToArray(props.blockSize).forEach((value) => {
      assertMeasurement(value.value, "blockSize");
      assertMeasurementPositive(value.value, "blockSize");
    });
    normalizeToArray(props.blockSizeRange).forEach((value) => {
      assertMeasurement(value.min, "blockSizeRange.min");
      assertMeasurement(value.max, "blockSizeRange.max");
      assertMeasurementPositive(value.min, "blockSizeRange.min");
      assertMeasurementPositive(value.max, "blockSizeRange.max");
      assertMatchingUnits(
        value.min,
        value.max,
        "containerQueries.blockSizeRangeUnits"
      );
      assertCondition(
        value.min.getValue() <= value.max.getValue(),
        "blockSizeRange min must be less than or equal to max"
      );
    });
  };

  const validateAspectRatioValues = (
    props: IContainerQueryAspectRatio
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
    if (
      props.minAspectRatio &&
      props.maxAspectRatio &&
      !Array.isArray(props.minAspectRatio) &&
      !Array.isArray(props.maxAspectRatio)
    ) {
      const minValue = ratioToFloat(props.minAspectRatio);
      const maxValue = ratioToFloat(props.maxAspectRatio);
      assertCondition(
        minValue <= maxValue,
        "minAspectRatio must be less than or equal to maxAspectRatio"
      );
    }
  };

  const validateStyleValues = (props: IContainerQueryStyle): void => {
    if (!props.style) return;
    const entries = Object.entries(props.style);
    assertCondition(entries.length > 0, "style conditions must not be empty.");

    entries.forEach(([name, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        assertCondition(value.length > 0, `style.${name} must not be empty`);
        value.forEach((entry, index) => {
          assertCondition(
            isStyleValue(entry),
            `style.${name}[${index}] must be a primitive or measurement`
          );
        });
        return;
      }
      assertCondition(
        isStyleValue(value),
        `style.${name} must be a primitive or measurement`
      );
    });
  };

  const validateCustomFeatures = (
    props: IContainerQueryCustomFeatures
  ): void => {
    if (!props.customFeatures) return;
    const entries = Object.entries(props.customFeatures);
    assertCondition(entries.length > 0, "customFeatures should not be empty.");

    entries.forEach(([name, value]) => {
      const trimmedName = name.trim();
      assertCondition(
        trimmedName.length > 0,
        "Custom feature name must be non-empty."
      );
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((entry, index) => {
          assertCondition(
            isStyleValue(entry),
            `Custom feature "${trimmedName}[${index}]" must be a primitive or a measurement.`
          );
        });
        return;
      }
      assertCondition(
        isStyleValue(value),
        `Custom feature "${trimmedName}" must be a primitive or a measurement.`
      );
    });
  };

  return {
    runContainerQueryValidation,
    validateMinMaxWidth,
    validateWidthValuesPositive,
    validateMinMaxHeight,
    validateHeightValuesPositive,
    validateInlineSizeValues,
    validateBlockSizeValues,
    validateAspectRatioValues,
    validateStyleValues,
    validateCustomFeatures,
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
  validateInlineSizeValues,
  validateBlockSizeValues,
  validateAspectRatioValues,
  validateStyleValues,
  validateCustomFeatures,
} = defaultContainerQueryValidation;

export { defaultContainerQueryValidation };
