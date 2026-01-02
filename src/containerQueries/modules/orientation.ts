import type { ContainerQueryValidator } from "../helpers";

export interface IContainerQueryOrientation {
  orientation?: "portrait" | "landscape";
}

export type ContainerQueryOrientationValidator =
  ContainerQueryValidator<IContainerQueryOrientation>;

export type CSSContainerOrientationFeature = IContainerQueryOrientation;
