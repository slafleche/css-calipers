import type { IContainerQueryBlock } from "../modules/block";

export const lintBlockRedundancy = (
  props: IContainerQueryBlock,
): void => {
  if (!props.blockSize) return;
  if (props.blockSizeRange) {
    throw new Error(
      "blockSize should not be combined with blockSizeRange",
    );
  }
};

export const lintBlockRangeCollapse = (
  props: IContainerQueryBlock,
): void => {
  if (!props.blockSizeRange) return;
  const { min, max } = props.blockSizeRange;
  if (min.equals(max)) {
    throw new Error(
      "blockSizeRange min and max are equal; use blockSize instead",
    );
  }
};
