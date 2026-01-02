import { hasCssMethod } from "../../core";
import type { IContainerQueryStyle } from "../modules/style";

const isComparisonShape = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null) return false;
  return "operator" in value && "value" in value;
};

export const lintStyleCondition = (
  props: IContainerQueryStyle,
): void => {
  if (!props.style) return;

  if (!Object.keys(props.style).length) {
    throw new Error("style conditions must not be empty.");
  }

  Object.values(props.style).forEach((value) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) return;
    if (hasCssMethod(value)) return;
    if (isComparisonShape(value)) {
      throw new Error(
        "style conditions must not contain comparisons.",
      );
    }
  });
};
