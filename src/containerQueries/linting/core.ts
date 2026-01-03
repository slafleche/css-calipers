import type { IContainerQueryCore } from "../containerQueries";

export const lintWidthExactRedundancy = (
  props: IContainerQueryCore,
): void => {
  if (!props.minWidth || !props.maxWidth) return;
  if (Array.isArray(props.minWidth) || Array.isArray(props.maxWidth)) {
    return;
  }
  if (props.minWidth.equals(props.maxWidth)) {
    throw new Error(
      "minWidth should not be combined with maxWidth when both are equal",
    );
  }
};

export const lintHeightExactRedundancy = (
  props: IContainerQueryCore,
): void => {
  if (!props.minHeight || !props.maxHeight) return;
  if (Array.isArray(props.minHeight) || Array.isArray(props.maxHeight)) {
    return;
  }
  if (props.minHeight.equals(props.maxHeight)) {
    throw new Error(
      "minHeight should not be combined with maxHeight when both are equal",
    );
  }
};
