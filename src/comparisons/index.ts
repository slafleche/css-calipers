import type { ContainerQueryModuleKeysMap } from "../containerQueries/moduleRegistry";
import type { IMeasurement } from "../core";

export type IComparisonOperator = "<" | "<=" | ">" | ">=" | "=";

export type ContentQueryVariable =
  ContainerQueryModuleKeysMap[keyof ContainerQueryModuleKeysMap];

export type ContentQueryComparisonValue =
  | IMeasurement
  | number
  | string;

export type Comparison<
  Variable = ContentQueryVariable,
  Value = ContentQueryComparisonValue,
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};

export type ComparisonValue<Value = ContentQueryComparisonValue> = {
  operator: IComparisonOperator;
  value: Value;
};

export const compare = {
  eq: (value: ContentQueryComparisonValue): ComparisonValue => ({
    operator: "=",
    value,
  }),
  lt: (value: ContentQueryComparisonValue): ComparisonValue => ({
    operator: "<",
    value,
  }),
  lte: (value: ContentQueryComparisonValue): ComparisonValue => ({
    operator: "<=",
    value,
  }),
  gt: (value: ContentQueryComparisonValue): ComparisonValue => ({
    operator: ">",
    value,
  }),
  gte: (value: ContentQueryComparisonValue): ComparisonValue => ({
    operator: ">=",
    value,
  }),
};
