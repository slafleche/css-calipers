import type {
  IContainerQueryCore,
} from "./containerQueries";
import type {
  IContainerQueryBlock,
  IContainerQueryInline,
  IContainerQueryAspectRatio,
  IContainerQueryStyle,
} from "./modules";
import { IContainerQueryCustomFeatures } from "./modules/custom";

export type ContainerQueryModuleId =
  | "core"
  | "inline"
  | "block"
  | "aspectRatio"
  | "style"
  | "custom";

export type ContainerQueryModulePropsMap = {
  core: IContainerQueryCore;
  block: IContainerQueryBlock;
  custom: IContainerQueryCustomFeatures;
  inline: IContainerQueryInline;
  aspectRatio: IContainerQueryAspectRatio;
  style: IContainerQueryStyle;
};

export type ContentQueryValues =
  | IContainerQueryCore[keyof IContainerQueryCore]
  | IContainerQueryInline[keyof IContainerQueryInline]
  | IContainerQueryBlock[keyof IContainerQueryBlock]
  | IContainerQueryAspectRatio[keyof IContainerQueryAspectRatio]
  | IContainerQueryStyle[keyof IContainerQueryStyle]
  | IContainerQueryCustomFeatures[keyof IContainerQueryCustomFeatures];

export type ContainerQueryModuleKeysMap = {
  core: "minWidth" | "maxWidth" | "minHeight" | "maxHeight";
  inline: "inlineSize" | "inlineSizeRange";
  block: "blockSize" | "blockSizeRange";
  aspectRatio: "aspectRatio" | "minAspectRatio" | "maxAspectRatio";
  style: "style";
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
