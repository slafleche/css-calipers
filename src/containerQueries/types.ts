import type { Properties } from 'csstype';
import type { IMeasurement } from '../core';
import type {
  CSSComparison,
  CSSRange,
  CSSContainerSizeFeature,
} from './modules/size';

export type CSSContainerType = 'inline-size' | 'size' | 'normal';
export type CSSContainerName = string;

export type ContainerQueryInvalidValueMode = 'allow' | 'log' | 'throw';
export type ContainerQueryLintingMode = 'allow' | 'log' | 'throw';

export type ContainerQueryBuilderConfig = {
  errorHandling?: {
    invalidValueMode?: ContainerQueryInvalidValueMode;
    lintingMode?: ContainerQueryLintingMode;
  };
};

type CSSTypeProperties = Properties<number | (string & {})>;

export type CSSContainerProperties = {
  [Property in keyof CSSTypeProperties]: CSSTypeProperties[Property];
};

export type CSSContainerCondition =
  | CSSContainerSizeFeature
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

export type CSSContainerQueryProps = CSSContainerQueryRule['query'];

export type CSSContainerQueries = Record<string, CSSContainerQueryRule>;

export type ContainerQueryComparison = CSSComparison<IMeasurement>;
export type ContainerQueryRange = CSSRange<IMeasurement>;
