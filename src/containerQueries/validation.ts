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
    if (props.minWidth) {
      assertMeasurement(props.minWidth, "minWidth");
      assertMeasurementPositive(props.minWidth, "minWidth");
    }
    if (props.maxWidth) {
      assertMeasurement(props.maxWidth, "maxWidth");
      assertMeasurementPositive(props.maxWidth, "maxWidth");
    }
  };

  const validateMinMaxHeight = (props: IContainerQueryCore): void => {
    if (!props.minHeight || !props.maxHeight) return;
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
    if (props.minHeight) {
      assertMeasurement(props.minHeight, "minHeight");
      assertMeasurementPositive(props.minHeight, "minHeight");
    }
    if (props.maxHeight) {
      assertMeasurement(props.maxHeight, "maxHeight");
      assertMeasurementPositive(props.maxHeight, "maxHeight");
    }
  };

  const validateInlineSizeValues = (props: IContainerQueryInline): void => {
    if (props.inlineSize) {
      assertMeasurement(props.inlineSize.value, "inlineSize");
      assertMeasurementPositive(props.inlineSize.value, "inlineSize");
    }
    if (props.inlineSizeRange) {
      assertMeasurement(props.inlineSizeRange.min, "inlineSizeRange.min");
      assertMeasurement(props.inlineSizeRange.max, "inlineSizeRange.max");
      assertMeasurementPositive(
        props.inlineSizeRange.min,
        "inlineSizeRange.min"
      );
      assertMeasurementPositive(
        props.inlineSizeRange.max,
        "inlineSizeRange.max"
      );
      assertMatchingUnits(
        props.inlineSizeRange.min,
        props.inlineSizeRange.max,
        "containerQueries.inlineSizeRangeUnits"
      );
      assertCondition(
        props.inlineSizeRange.min.getValue() <=
          props.inlineSizeRange.max.getValue(),
        "inlineSizeRange min must be less than or equal to max"
      );
    }
  };

  const validateBlockSizeValues = (props: IContainerQueryBlock): void => {
    if (props.blockSize) {
      assertMeasurement(props.blockSize.value, "blockSize");
      assertMeasurementPositive(props.blockSize.value, "blockSize");
    }
    if (props.blockSizeRange) {
      assertMeasurement(props.blockSizeRange.min, "blockSizeRange.min");
      assertMeasurement(props.blockSizeRange.max, "blockSizeRange.max");
      assertMeasurementPositive(props.blockSizeRange.min, "blockSizeRange.min");
      assertMeasurementPositive(props.blockSizeRange.max, "blockSizeRange.max");
      assertMatchingUnits(
        props.blockSizeRange.min,
        props.blockSizeRange.max,
        "containerQueries.blockSizeRangeUnits"
      );
      assertCondition(
        props.blockSizeRange.min.getValue() <=
          props.blockSizeRange.max.getValue(),
        "blockSizeRange min must be less than or equal to max"
      );
    }
  };

  const validateAspectRatioValues = (
    props: IContainerQueryAspectRatio
  ): void => {
    if (props.aspectRatio) {
      assertRatio(props.aspectRatio, "aspectRatio");
      assertRatioPositive(props.aspectRatio, "aspectRatio");
    }
    if (props.minAspectRatio) {
      assertRatio(props.minAspectRatio, "minAspectRatio");
      assertRatioPositive(props.minAspectRatio, "minAspectRatio");
    }
    if (props.maxAspectRatio) {
      assertRatio(props.maxAspectRatio, "maxAspectRatio");
      assertRatioPositive(props.maxAspectRatio, "maxAspectRatio");
    }
    if (props.minAspectRatio && props.maxAspectRatio) {
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
