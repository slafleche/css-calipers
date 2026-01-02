import type { IContainerQueryCustomFeatures } from "../modules/custom";

export const lintCustomFeatures = (
  props: IContainerQueryCustomFeatures,
): void => {
  if (!props.customFeatures) return;
  if (!Object.keys(props.customFeatures).length) {
    throw new Error("customFeatures should not be empty.");
  }
};
