import type {
  IContainerQueryCore,
  IContainerQueryCoreVariables,
} from "./containerQueries";
import type {
  IContainerQueryBlock,
  IContainerQueryInline,
  IContainerQueryOrientation,
  IContainerQueryRange,
  IContainerQueryExact,
  IContainerQueryBlockVariables,
  IContainerQueryInlineVariables,
  IContainerQueryResolutionVariables,
  IContainerQueryOrientationVariables,
  IContainerQueryAspectRatioVariables,
  IContainerQueryResolution,
} from "./modules";
import { IContainerQueryCustomFeatures } from "./modules/custom";

export type ContainerQueryModuleId =
  | "core"
  | "size"
  | "range"
  | "inline"
  | "block"
  | "orientation"
  | "custom";

export type ContainerQueryModulePropsMap = {
  core: IContainerQueryCore;
  aspectRatio: IContainerQueryExact;
  block: IContainerQueryBlock;
  custom: IContainerQueryCustomFeatures;
  inline: IContainerQueryInline;
  orientation: IContainerQueryOrientation;
  resolution: IContainerQueryResolution;
};

export type ContentQueryValues =
  | IContainerQueryCoreVariables
  | IContainerQueryAspectRatioVariables
  | IContainerQueryBlockVariables
  | IContainerQueryInlineVariables
  | IContainerQueryOrientationVariables
  | IContainerQueryResolutionVariables;

export type ContainerQueryModuleKeysMap = {
  core: "type" | "minWidth" | "maxWidth" | "minHeight" | "maxHeight";
  size:
    | "width"
    | "height"
    | "aspectRatio"
    | "minAspectRatio"
    | "maxAspectRatio"
    | "orientation";
  range: "minWidth" | "maxWidth" | "minHeight" | "maxHeight";
  inline: "inlineSize" | "minInlineSize" | "maxInlineSize";
  block: "blockSize" | "minBlockSize" | "maxBlockSize";
  orientation: "orientation";
  custom: "customFeatures";
};

export type ContainerQueryModuleKeys<M extends ContainerQueryModuleId> =
  ContainerQueryModuleKeysMap[M];

export type ContainerQueryModulesList = readonly ContainerQueryModuleId[];

export const defineContainerQueryModules = <
  T extends ContainerQueryModulesList
>(
  ...modules: T
): T => modules;
