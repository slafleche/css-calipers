import type {
  ContentQueryVariable,
  IComparisonOperator,
} from "../../comparisons";
import type { IRatio } from "../../ratio";
import type {
  ContainerQueryBuilderHelpers,
  ContainerQueryValidator,
} from "../helpers";
import { applyContainerQueryValidation } from "../helpers";
import { defaultContainerQueryValidation } from "../validation";
import { runContainerQueryLint } from "../linting";
import {
  lintAspectRatioRangeCollapse,
  lintAspectRatioRedundancy,
} from "../linting/aspectRatio";

export interface IContainerQueryAspectRatio {
  aspectRatio?: IRatio | IRatio[];
  minAspectRatio?: IRatio | IRatio[];
  maxAspectRatio?: IRatio | IRatio[];
}

export type ContainerQueryAspectRatioValidator =
  ContainerQueryValidator<IContainerQueryAspectRatio>;

export type AspectRatioComparisonVariable =
  | "aspectRatio"
  | "minAspectRatio"
  | "maxAspectRatio";

export type ComparisonAspectRatio<
  Variable = ContentQueryVariable,
  Value = IRatio
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};

export const emitAspectRatioFeatures = (
  props: IContainerQueryAspectRatio,
  helpers: ContainerQueryBuilderHelpers,
  validate?: ContainerQueryAspectRatioValidator
): void => {
  const allowQueryArrays = helpers.config.allowQueryArrays !== false;
  const assertNoArray = (value: unknown, label: string): void => {
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(`${label} does not allow arrays.`);
    }
  };

  const { runContainerQueryValidation, validateAspectRatioValues } =
    defaultContainerQueryValidation;

  if (
    !runContainerQueryValidation(
      props,
      helpers,
      validateAspectRatioValues,
      "aspectRatio",
      "aspect ratio values must be valid ratio greater than 0"
    )
  ) {
    return;
  }

  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintAspectRatioRedundancy,
      "aspectRatio should not be combined with minAspectRatio or maxAspectRatio"
    )
  ) {
    return;
  }
  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintAspectRatioRangeCollapse,
      "minAspectRatio and maxAspectRatio are equal; use aspectRatio instead"
    )
  ) {
    return;
  }

  if (!applyContainerQueryValidation(props, helpers, validate, "aspectRatio")) {
    return;
  }

  const emitFeature = (name: string, value: IRatio | IRatio[]): void => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        (helpers.addFeatureUnsafe ?? helpers.addFeature)(name, entry);
      });
      return;
    }
    helpers.addFeature(name, value);
  };

  if (props.aspectRatio !== undefined) {
    assertNoArray(props.aspectRatio, "aspectRatio");
    emitFeature("aspect-ratio", props.aspectRatio);
  }
  if (props.minAspectRatio !== undefined) {
    assertNoArray(props.minAspectRatio, "minAspectRatio");
    emitFeature("min-aspect-ratio", props.minAspectRatio);
  }
  if (props.maxAspectRatio !== undefined) {
    assertNoArray(props.maxAspectRatio, "maxAspectRatio");
    emitFeature("max-aspect-ratio", props.maxAspectRatio);
  }
};
