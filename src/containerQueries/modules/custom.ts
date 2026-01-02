import { IMeasurement } from "../../core";
import type {
  ContainerQueryBuilderHelpers,
  ContainerQueryValidator,
} from "../helpers";
import { applyContainerQueryValidation } from "../helpers";
import { defaultContainerQueryValidation } from "../validation";
import { runContainerQueryLint } from "../linting";
import { lintCustomFeatures } from "../linting/custom";

type ContainerQueryFeatureValue = string | number | IMeasurement;

export interface IContainerQueryCustomFeatures {
  customFeatures?: Record<string, ContainerQueryFeatureValue>;
}

export type ContainerQueryCustomFeaturesValidator =
  ContainerQueryValidator<IContainerQueryCustomFeatures>;

export const emitCustomFeatures = (
  props: IContainerQueryCustomFeatures,
  helpers: ContainerQueryBuilderHelpers,
  validate?: ContainerQueryCustomFeaturesValidator
): void => {
  const {
    runContainerQueryValidation,
    validateCustomFeatures,
  } = defaultContainerQueryValidation;

  if (
    !runContainerQueryValidation(
      props,
      helpers,
      validateCustomFeatures,
      "custom",
      "custom features must be valid and non-empty",
    )
  ) {
    return;
  }

  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintCustomFeatures,
      "customFeatures should not be empty",
    )
  ) {
    return;
  }

  if (!applyContainerQueryValidation(props, helpers, validate, "custom")) {
    return;
  }

  const { addFeature } = helpers;

  if (!props.customFeatures) return;
  Object.entries(props.customFeatures).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addFeature(trimmedName, value);
  });
};
