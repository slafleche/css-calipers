import type {
  ContentQueryComparisonValue,
  ContentQueryVariable,
  IComparisonOperator,
} from "../../comparisons";
import type { IFraction, RatioParts } from "../../fraction";
import type { ContainerQueryValidator } from "../helpers";

export interface IContainerQueryAspectRatio {
  aspectRatio?: RatioValue;
  minAspectRatio?: RatioValue;
  maxAspectRatio?: RatioValue;
}

export type ContainerQueryAspectRatioValidator =
  ContainerQueryValidator<IContainerQueryAspectRatio>;

type UnsignedIntegerString = Exclude<`${bigint}`, `-${string}`>;
type UnsignedFloatString =
  | UnsignedIntegerString
  | `${UnsignedIntegerString}.${UnsignedIntegerString}`;

export type RatioString =
  | UnsignedFloatString
  | `${UnsignedFloatString}/${UnsignedFloatString}`;

type NumericRatioValue = Extract<ContentQueryComparisonValue, number | string>;

export type RatioValue =
  | NumericRatioValue
  | RatioString
  | IFraction
  | RatioParts;

export type AspectRatioComparisonVariable =
  | "aspectRatio"
  | "minAspectRatio"
  | "maxAspectRatio";

export type ComparisonAspectRatio<
  Variable = ContentQueryVariable,
  Value = IFraction
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};
