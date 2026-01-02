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
  minWidth?: IMeasurement;
  maxWidth?: IMeasurement;
  minHeight?: IMeasurement;
  maxHeight?: IMeasurement;
};

export type CSSContainerInlineCondition = {
  inlineSize?: CSSComparison<IMeasurement>;
  inlineSizeRange?: CSSRange<IMeasurement>;
};

export type CSSContainerBlockCondition = {
  blockSize?: CSSComparison<IMeasurement>;
  blockSizeRange?: CSSRange<IMeasurement>;
};

export type CSSContainerAspectRatioCondition = {
  aspectRatio?: IRatio;
  minAspectRatio?: IRatio;
  maxAspectRatio?: IRatio;
};

export type CSSContainerStyleCondition = CSSContainerProperties;

export type CSSContainerCustomFeatures = Record<
  string,
  string | number | IMeasurement
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

export interface CSSContainerQueryRule {
  container?: CSSContainerQueryContainer;
  query?: CSSContainerQuery;
  styles: CSSContainerProperties;
}

export type CSSContainerQueryProps = CSSContainerQueryRule["query"];

export type CSSContainerQueries = Record<string, CSSContainerQueryRule>;

export type ContainerQueryComparison = CSSComparison<IMeasurement>;
export type ContainerQueryRange = CSSRange<IMeasurement>;
