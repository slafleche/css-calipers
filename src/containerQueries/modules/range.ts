import type { IMeasurement } from "../../core";
import type { ContainerQueryValidator } from "../helpers";
import type { CSSRange } from "../comparisons";

export interface IContainerQueryRange {
  widthRange?: CSSRange<IMeasurement>;
  heightRange?: CSSRange<IMeasurement>;
}

export type ContainerQueryRangeValidator =
  ContainerQueryValidator<IContainerQueryRange>;

export type CSSContainerRangeSizeFeature = IContainerQueryRange;
