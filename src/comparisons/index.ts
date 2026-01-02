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
  readonly __comparisonBrand: unique symbol;
};

export const compare = {
  eq: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: "=",
    value,
  } as ComparisonValue<T>),
  lt: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: "<",
    value,
  } as ComparisonValue<T>),
  lte: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: "<=",
    value,
  } as ComparisonValue<T>),
  gt: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: ">",
    value,
  } as ComparisonValue<T>),
  gte: <T extends ContentQueryComparisonValue>(
    value: T,
  ): ComparisonValue<T> => ({
    operator: ">=",
    value,
  } as ComparisonValue<T>),
};
