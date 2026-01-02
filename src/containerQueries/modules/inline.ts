import type { IMeasurement } from "../../core";
import type { ContainerQueryValidator } from "../helpers";
import type { CSSComparison, CSSRange } from "../comparisons";

export interface IContainerQueryInline {
  inlineSize?: CSSComparison<IMeasurement>;
  inlineSizeRange?: CSSRange<IMeasurement>;
}

export type ContainerQueryInlineValidator =
  ContainerQueryValidator<IContainerQueryInline>;

export type CSSContainerInlineSizeFeature = IContainerQueryInline;
