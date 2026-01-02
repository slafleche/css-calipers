import type { Properties } from "csstype";
import type { IRatio } from "../ratio";
import type { ComparisonValue } from "../comparisons";
import type { IMeasurement } from "../core";

export type CSSContainerType = "inline-size" | "size" | "normal";
export type CSSContainerName = string;

type CSSTypeProperties = Properties<number | (string & {})>;

export type CSSContainerProperties = {
  [Property in keyof CSSTypeProperties]:
    | CSSTypeProperties[Property]
    | IMeasurement
    | Array<CSSTypeProperties[Property] | IMeasurement>;
};

type CSSRangeOperator = "<" | "<=";

export type CSSComparison<TValue> = ComparisonValue<TValue>;

export type CSSRange<TValue> =
  | ({ min: TValue; max: TValue; minOperator: CSSRangeOperator } & {
      readonly __rangeBrand: unique symbol;
    })
  | ({ min: TValue; max: TValue; maxOperator: CSSRangeOperator } & {
      readonly __rangeBrand: unique symbol;
    });

export type CSSContainerCoreCondition = {
  minWidth?: IMeasurement | IMeasurement[];
  maxWidth?: IMeasurement | IMeasurement[];
  minHeight?: IMeasurement | IMeasurement[];
  maxHeight?: IMeasurement | IMeasurement[];
};

export type CSSContainerInlineCondition = {
  inlineSize?: CSSComparison<IMeasurement> | CSSComparison<IMeasurement>[];
  inlineSizeRange?: CSSRange<IMeasurement> | CSSRange<IMeasurement>[];
};

export type CSSContainerBlockCondition = {
  blockSize?: CSSComparison<IMeasurement> | CSSComparison<IMeasurement>[];
  blockSizeRange?: CSSRange<IMeasurement> | CSSRange<IMeasurement>[];
};

export type CSSContainerAspectRatioCondition = {
  aspectRatio?: IRatio | IRatio[];
  minAspectRatio?: IRatio | IRatio[];
  maxAspectRatio?: IRatio | IRatio[];
};

export type CSSContainerStyleCondition = CSSContainerProperties;

export type CSSContainerCustomFeatures = Record<
  string,
  | string
  | number
  | IMeasurement
  | Array<string | number | IMeasurement>
>;

export type CSSContainerCustomCondition = {
  customFeatures?: CSSContainerCustomFeatures;
};

export type CSSContainerConditionBase = CSSContainerCoreCondition &
  CSSContainerInlineCondition &
  CSSContainerBlockCondition &
  CSSContainerAspectRatioCondition &
  CSSContainerCustomCondition & {
    style?: CSSContainerStyleCondition;
  };

export type CSSContainerCondition =
  | CSSContainerConditionBase
  | { and: CSSContainerCondition[] }
  | { or: CSSContainerCondition[] }
  | { not: CSSContainerCondition };

export interface CSSContainerQuery {
  name?: CSSContainerName;
  condition: CSSContainerCondition;
}

export interface CSSContainerQueryContainer {
  type?: CSSContainerType;
  name?: CSSContainerName;
}

export interface CSSContainerQueryRuleInput {
  container?: CSSContainerQueryContainer;
  query?: CSSContainerQuery;
}

export interface CSSContainerQueryRuleOutput
  extends CSSContainerQueryRuleInput {
  styles: CSSContainerProperties;
}

export type CSSContainerQueryRule = CSSContainerQueryRuleOutput;

export type CSSContainerQueryProps = CSSContainerQueryRuleInput["query"];

export type CSSContainerQueries = Record<string, CSSContainerQueryRuleInput>;

export type ContainerQueryComparison = CSSComparison<IMeasurement>;
export type ContainerQueryRange = CSSRange<IMeasurement>;
