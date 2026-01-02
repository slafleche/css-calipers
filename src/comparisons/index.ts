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
  eq: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: "=",
    value,
  }),
  lt: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: "<",
    value,
  }),
  lte: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: "<=",
    value,
  }),
  gt: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: ">",
    value,
  }),
  gte: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: ">=",
    value,
  }),
};
