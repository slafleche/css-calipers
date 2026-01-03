import type { IContainerQueryBlock } from "../modules/block";
import { normalizeToArray } from "../../internal/normalizeToArray";

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
  normalizeToArray(props.blockSizeRange).forEach((range) => {
    const { min, max } = range;
    if (min.equals(max)) {
      throw new Error(
        "blockSizeRange min and max are equal; use blockSize instead",
      );
    }
  });
};
