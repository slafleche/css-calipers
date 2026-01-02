import { hasCssMethod, IMeasurement } from "../../core";
import { ContainerQueryValidator } from "../helpers";

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
  if (!applyContainerQueryValidation(props, helpers, validate, "custom")) {
    return;
  }

  const { addFeature } = helpers;

  if (!props.customFeatures) return;
  Object.entries(props.customFeatures).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Custom feature name must be non-empty.");
    }
    if (typeof value === "object" && !hasCssMethod(value)) {
      throw new Error(
        `Custom feature "${trimmedName}" must be a primitive or a measurement.`
      );
    }
    addFeature(trimmedName, value);
  });
};
