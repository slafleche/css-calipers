import { CSSComparison, CSSRange } from "../../../dist/esm/containerQueries";
import type { Comparison, IComparisonOperator } from "../../comparisons";
import type { IMeasurement } from "../../core";
import type { ContainerQueryValidator } from "../helpers";

export interface IContainerQueryInline {
  inlineSize?: CSSComparison<IMeasurement>;
  inlineSizeRange?: CSSRange<IMeasurement>;
}

export type ContainerQueryInlineValidator =
  ContainerQueryValidator<IContainerQueryInline>;

export type CSSContainerInlineSizeFeature = IContainerQueryInline;

export type InlineComparisonVariable = "inlineSize";

export type InlineComparison = Comparison<
  InlineComparisonVariable,
  SizeComparisonValue
>;

export type ComparisonInline<
  Variable = IContainerQueryInline[keyof IContainerQueryInline],
  Value = IMeasurement
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};
