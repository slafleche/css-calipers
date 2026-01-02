import type { IMeasurement } from "../../core";
import type { ContainerQueryValidator } from "../helpers";
import type { CSSComparison, CSSRange } from "../comparisons";

export interface IContainerQueryBlock {
  blockSize?: CSSComparison<IMeasurement>;
  blockSizeRange?: CSSRange<IMeasurement>;
}

export type ContainerQueryBlockValidator =
  ContainerQueryValidator<IContainerQueryBlock>;

export type CSSContainerBlockSizeFeature = IContainerQueryBlock;
