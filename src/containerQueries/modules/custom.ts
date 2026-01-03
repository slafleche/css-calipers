import { IMeasurement } from "../../core";
import type {
  ContainerQueryBuilderHelpers,
  ContainerQueryValidator,
} from "../helpers";
import { applyContainerQueryValidation } from "../helpers";
import { defaultContainerQueryValidation } from "../validation";
import { runContainerQueryLint } from "../linting";
import { lintCustomFeatures } from "../linting/custom";
import { normalizeToArray } from "../../internal/normalizeToArray";

type ContainerQueryFeatureEntry = string | number | IMeasurement;
type ContainerQueryFeatureValue =
  | ContainerQueryFeatureEntry
  | ContainerQueryFeatureEntry[];

export interface IContainerQueryCustomFeatures {
  customFeatures?: Record<string, ContainerQueryFeatureValue>;
}

export type ContainerQueryCustomFeaturesValidator =
  ContainerQueryValidator<IContainerQueryCustomFeatures>;

export const emitCustomFeatures = (
  props: IContainerQueryCustomFeatures,
  helpers: ContainerQueryBuilderHelpers,
  options?: {
    allowQueryArrays?: boolean;
  },
  validate?: ContainerQueryCustomFeaturesValidator
): void => {
  const { runContainerQueryValidation, validateCustomFeatures } =
    defaultContainerQueryValidation;

  if (
    !runContainerQueryValidation(
      props,
      helpers,
      validateCustomFeatures,
      "custom",
      "custom features must be valid and non-empty"
    )
  ) {
    return;
  }

  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintCustomFeatures,
      "customFeatures should not be empty"
    )
  ) {
    return;
  }

  if (!applyContainerQueryValidation(props, helpers, validate, "custom")) {
    return;
  }

  const { addFeatureUnsafe, addFeature } = helpers;
  const allowQueryArrays =
    options?.allowQueryArrays ?? helpers.config.allowQueryArrays ?? true;

  if (!props.customFeatures) return;
  Object.entries(props.customFeatures).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(
        `Custom feature "${trimmedName}" does not allow arrays.`,
      );
    }
    if (Array.isArray(value)) {
      normalizeToArray(value).forEach((entry) => {
        (addFeatureUnsafe ?? addFeature)(trimmedName, entry);
      });
      return;
    }
    addFeature(trimmedName, value);
  });
};
