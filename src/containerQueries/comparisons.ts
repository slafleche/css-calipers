export type CSSComparisonOperator = "<" | "<=" | ">" | ">=" | "=";

export type CSSComparison<T> = {
  operator: CSSComparisonOperator;
  value: T;
};

export type CSSRangeBoundaryOperator = "<" | "<=";

export type CSSRange<T> =
  | {
      min: T;
      max: T;
      minOperator: CSSRangeBoundaryOperator;
      maxOperator?: never;
    }
  | {
      min: T;
      max: T;
      maxOperator: CSSRangeBoundaryOperator;
      minOperator?: never;
    };
