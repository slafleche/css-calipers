import type { ComplexStyleRule, StyleRule } from "../mediaQueries/types";
import type {
  CSSContainerCondition,
  CSSContainerQueries,
} from "./types";
import type {
  ContainerQueryBuilderConfig,
} from "./helpers";
import { buildContainerConditionString } from "./containerQueries";
import type {
  ContainerQueryModuleId,
  ContainerQueryModulesList,
} from "./moduleRegistry";

type ContainerQueryStyleMap<TQueries> = Partial<
  Record<keyof TQueries, StyleRule>
>;

const ALL_CONTAINER_QUERY_MODULES: ContainerQueryModuleId[] = [
  "core",
  "inline",
  "block",
  "aspectRatio",
  "style",
  "custom",
];

const MODULE_KEYS: Record<ContainerQueryModuleId, readonly string[]> = {
  core: ["minWidth", "maxWidth", "minHeight", "maxHeight"],
  inline: ["inlineSize", "inlineSizeRange"],
  block: ["blockSize", "blockSizeRange"],
  aspectRatio: ["aspectRatio", "minAspectRatio", "maxAspectRatio"],
  style: ["style"],
  custom: ["customFeatures"],
};

const KEY_TO_MODULE: Record<string, ContainerQueryModuleId> =
  Object.fromEntries(
    (Object.keys(MODULE_KEYS) as ContainerQueryModuleId[]).flatMap(
      (moduleId) =>
        MODULE_KEYS[moduleId].map(
          (key) => [key, moduleId] as const,
        ),
    ),
  );

const collectConditionKeys = (
  condition: CSSContainerCondition,
  keys: Set<string>,
): void => {
  if ("and" in condition) {
    condition.and.forEach((entry) => collectConditionKeys(entry, keys));
    return;
  }
  if ("or" in condition) {
    condition.or.forEach((entry) => collectConditionKeys(entry, keys));
    return;
  }
  if ("not" in condition) {
    collectConditionKeys(condition.not, keys);
    return;
  }
  Object.keys(condition).forEach((key) => keys.add(key));
};

const collectAndConditionKeys = (
  condition: CSSContainerCondition,
  keys: string[],
): void => {
  if ("and" in condition) {
    condition.and.forEach((entry) => collectAndConditionKeys(entry, keys));
    return;
  }
  if ("or" in condition || "not" in condition) {
    return;
  }
  Object.keys(condition).forEach((key) => keys.push(key));
};

const guardUnsupportedCondition = (
  condition: CSSContainerCondition,
  modules: readonly ContainerQueryModuleId[],
  config: ContainerQueryBuilderConfig,
  label: string,
): void => {
  const allowed = new Set<string>();

  modules.forEach((moduleId) => {
    MODULE_KEYS[moduleId].forEach((key) => {
      allowed.add(key);
    });
  });

  const conditionKeys = new Set<string>();
  collectConditionKeys(condition, conditionKeys);

  conditionKeys.forEach((key) => {
    if (allowed.has(key)) return;
    const mode = config.errorHandling?.invalidValueMode ?? "throw";
    const moduleHint = KEY_TO_MODULE[key];
    const moduleSuffix = moduleHint
      ? ` Add "${moduleHint}" to modules.`
      : "";
    const message = `Container query factory "${label}" received unsupported feature "${key}".${moduleSuffix}`;

    if (mode === "log") {
      console.warn(message);
      return;
    }
    if (mode === "allow") return;

    throw new Error(message);
  });
};

const guardDuplicateConditions = (
  condition: CSSContainerCondition,
  config: ContainerQueryBuilderConfig,
  label: string,
): void => {
  const keys: string[] = [];
  collectAndConditionKeys(condition, keys);

  const seen = new Set<string>();
  const duplicates = new Set<string>();
  keys.forEach((key) => {
    if (seen.has(key)) {
      duplicates.add(key);
      return;
    }
    seen.add(key);
  });

  if (!duplicates.size) return;

  const mode = config.errorHandling?.invalidValueMode ?? "throw";
  const message = `Container query factory "${label}" received duplicate condition "${Array.from(
    duplicates,
  ).join('", "')}".`;

  if (mode === "log") {
    console.warn(message);
    return;
  }
  if (mode === "allow") return;

  throw new Error(message);
};

export type ContainerQueryFactoryConfig<
  TModules extends ContainerQueryModulesList | undefined = undefined,
  TOutput = ComplexStyleRule,
> = ContainerQueryBuilderConfig & {
  label: string;
  modules?: TModules;
  output?: (container: ComplexStyleRule) => TOutput;
};

export const createContainerQueryFactory = () => <
  TModules extends ContainerQueryModulesList | undefined,
  TQueries extends CSSContainerQueries,
  TOutput = ComplexStyleRule,
>(options: {
  queries: TQueries;
  config: ContainerQueryFactoryConfig<TModules, TOutput>;
}) => {
  const modules = options.config.modules ?? ALL_CONTAINER_QUERY_MODULES;

  return (stylesByQuery: ContainerQueryStyleMap<TQueries>): TOutput => {
    const result: Record<string, StyleRule> = {};

    (Object.keys(stylesByQuery) as (keyof TQueries)[]).forEach((key) => {
      const styles = stylesByQuery[key];
      const rule = options.queries[key];
      if (!styles || !rule?.query) return;
      guardUnsupportedCondition(
        rule.query.condition,
        modules,
        options.config,
        options.config.label,
      );
      guardDuplicateConditions(
        rule.query.condition,
        options.config,
        options.config.label,
      );
      result[buildContainerConditionString(rule.query.condition)] = styles;
    });

    const containerQuery: ComplexStyleRule = {
      "@container": result,
    };

    return options.config.output
      ? options.config.output(containerQuery)
      : (containerQuery as TOutput);
  };
};

export const containerQueryFactory = createContainerQueryFactory();
