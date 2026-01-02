// export type ContainerQueryModuleId =
//   | "core"
//   | "exact"
//   | "range"
//   | "inline"
//   | "block"
//   | "orientation";

// export type ContainerQueryModulesList = readonly ContainerQueryModuleId[];

// export const defineContainerQueryModules = <
//   T extends ContainerQueryModulesList,
// >(
//   ...modules: T
// ): T => modules;

import type { IContainerQueryCore } from "./containerQueries";
import type {
  IContainerQueryBlock,
  IContainerQueryInline,
  IContainerQueryOrientation,
  IContainerQueryRange,
  IContainerQueryExact,
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
  range: IContainerQueryRange;
  inline: IContainerQueryInline;
  block: IContainerQueryBlock;
  exact: IContainerQueryExact;
  orientation: IContainerQueryOrientation;
  custom: IContainerQueryCustomFeatures;
};

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
