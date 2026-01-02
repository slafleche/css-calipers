import { fractionToFloat } from "../../core";
import type { IContainerQueryAspectRatio } from "../modules/aspectRatio";

export const lintAspectRatioRedundancy = (
  props: IContainerQueryAspectRatio,
): void => {
  if (!props.aspectRatio) return;
  if (props.minAspectRatio || props.maxAspectRatio) {
    throw new Error(
      "aspectRatio should not be combined with minAspectRatio or maxAspectRatio",
    );
  }
};

export const lintAspectRatioRangeCollapse = (
  props: IContainerQueryAspectRatio,
): void => {
  if (!props.minAspectRatio || !props.maxAspectRatio) return;
  if (
    fractionToFloat(props.minAspectRatio) ===
    fractionToFloat(props.maxAspectRatio)
  ) {
    throw new Error(
      "minAspectRatio and maxAspectRatio are equal; use aspectRatio instead",
    );
  }
};
