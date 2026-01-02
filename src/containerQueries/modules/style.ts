import type { CSSContainerProperties } from "../types";
import type { ContainerQueryValidator } from "../helpers";

export type CSSContainerStyleCondition = CSSContainerProperties;

export interface IContainerQueryStyle {
  style?: CSSContainerStyleCondition;
}

export type IContainerQueryStyleVariables = IContainerQueryStyle["style"];

export type ContainerQueryStyleValidator =
  ContainerQueryValidator<IContainerQueryStyle>;

export type CSSContainerStyleFeature = IContainerQueryStyle;

export type ComparisonStyle = false;
