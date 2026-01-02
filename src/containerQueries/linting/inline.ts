import type { IContainerQueryInline } from "../modules/inline";

export const lintInlineRedundancy = (
  props: IContainerQueryInline,
): void => {
  if (!props.inlineSize) return;
  if (props.inlineSizeRange) {
    throw new Error(
      "inlineSize should not be combined with inlineSizeRange",
    );
  }
};

export const lintInlineRangeCollapse = (
  props: IContainerQueryInline,
): void => {
  if (!props.inlineSizeRange) return;
  const { min, max } = props.inlineSizeRange;
  if (min.equals(max)) {
    throw new Error(
      "inlineSizeRange min and max are equal; use inlineSize instead",
    );
  }
};
