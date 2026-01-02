import type { IMeasurement } from "../../core";
import type { ContainerQueryValidator } from "../helpers";
import type { CSSComparison } from "../comparisons";

export interface IContainerQueryExact {
  width?: CSSComparison<IMeasurement>;
  height?: CSSComparison<IMeasurement>;
}

export type ContainerQueryExactValidator =
  ContainerQueryValidator<IContainerQueryExact>;

export type CSSContainerExactSizeFeature = IContainerQueryExact;
