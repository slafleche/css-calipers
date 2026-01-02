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
  aspectRatio?: IRatio;
  minAspectRatio?: IRatio;
  maxAspectRatio?: IRatio;
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

  const { addFeature } = helpers;

  if (props.aspectRatio) {
    addFeature("aspect-ratio", props.aspectRatio);
  }
  if (props.minAspectRatio) {
    addFeature("min-aspect-ratio", props.minAspectRatio);
  }
  if (props.maxAspectRatio) {
    addFeature("max-aspect-ratio", props.maxAspectRatio);
  }
};
