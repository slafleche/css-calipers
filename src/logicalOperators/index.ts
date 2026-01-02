import type { ContainerQueryModuleKeysMap } from "../containerQueries/moduleRegistry";
import type { IMeasurement } from "../core";

export type IComparisonOperator = " and " | " or " | " not ";

// export type ContentQueryVariable =
//   ContainerQueryModuleKeysMap[keyof ContainerQueryModuleKeysMap];

// export type ContentQueryComparisonValue = IMeasurement | number | string;

// export type Comparison<
//   Variable = ContentQueryVariable,
//   Value = ContentQueryComparisonValue
// > = {
//   variable: Variable;
//   operator: IComparisonOperator;
//   value: Value;
// };

// export type ComparisonValue<Value = ContentQueryComparisonValue> = {
//   operator: IComparisonOperator;
//   value: Value;
//   readonly __comparisonBrand: unique symbol;
// };

