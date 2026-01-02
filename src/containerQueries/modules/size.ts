import type { IMeasurement } from '../../core';

export type CSSComparisonOperator = '<' | '<=' | '>' | '>=' | '=';

export type CSSComparison<T> = {
  operator: CSSComparisonOperator;
  value: T;
};

export type CSSRangeBoundaryOperator = '<' | '<=';

export type CSSRange<T> = {
  min: T;
  max: T;
  minOperator?: CSSRangeBoundaryOperator;
  maxOperator?: CSSRangeBoundaryOperator;
};

export type CSSContainerSizeFeature =
  | { minWidth: IMeasurement }
  | { maxWidth: IMeasurement }
  | { minHeight: IMeasurement }
  | { maxHeight: IMeasurement }
  | { width: CSSComparison<IMeasurement> }
  | { height: CSSComparison<IMeasurement> }
  | { inlineSize: CSSComparison<IMeasurement> }
  | { blockSize: CSSComparison<IMeasurement> }
  | { widthRange: CSSRange<IMeasurement> }
  | { heightRange: CSSRange<IMeasurement> }
  | { inlineSizeRange: CSSRange<IMeasurement> }
  | { blockSizeRange: CSSRange<IMeasurement> }
  | { orientation: 'portrait' | 'landscape' };
