import type { Comparison, IComparisonOperator } from "../../comparisons";
import type { IMeasurement } from "../../core";
import type { ContainerQueryValidator } from "../helpers";
import type { CSSComparison, CSSRange } from "../comparisons";
import { SizeComparisonValue } from "../containerQueries";

export interface IContainerQueryBlock {
  blockSize?: CSSComparison<IMeasurement>;
  blockSizeRange?: CSSRange<IMeasurement>;
}

export type ContainerQueryBlockValidator =
  ContainerQueryValidator<IContainerQueryBlock>;

export type CSSContainerBlockSizeFeature = IContainerQueryBlock;

export type BlockComparisonVariable = "blockSize";

export type BlockComparison = Comparison<
  BlockComparisonVariable,
  SizeComparisonValue
>;

export type ComparisonBlock<
  Variable = IContainerQueryBlock[keyof IContainerQueryBlock],
  Value = IMeasurement
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};
