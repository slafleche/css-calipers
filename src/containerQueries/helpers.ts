import type { IRatio } from "../ratio";
import type { IMeasurement } from "../core";
import { hasCssMethod } from "../core";
import type { ComparisonValue } from "../comparisons";
import type { CSSComparison, CSSRange } from "./types";
import type { ValidationResult } from "../validation";
import { normalizeValidationResult } from "../validation";

export type ContainerQueryValidationResult = ValidationResult;

export type ContainerQueryValidator<TConfig> = (
  config: TConfig
) => ContainerQueryValidationResult;

type ContainerQueryFeatureValue = string | number | IMeasurement | IRatio;

type ContainerQueryFeatureEmitter = (
  name: string,
  value: ContainerQueryFeatureValue
) => void;

type ContainerQueryConditionEmitter = (condition: string) => void;

export type ContainerQueryInvalidValueMode = "allow" | "log" | "throw";
export type ContainerQueryLintingMode = "allow" | "log" | "throw";

export type ContainerQueryBuilderConfig = {
  errorHandling?: {
    invalidValueMode?: ContainerQueryInvalidValueMode;
    lintingMode?: ContainerQueryLintingMode;
  };
};

export interface ContainerQueryBuilderHelpers {
  addFeature: ContainerQueryFeatureEmitter;
  addCondition: ContainerQueryConditionEmitter;
  config: ContainerQueryBuilderConfig;
}

export type ContainerQueryExtensionHandler<TConfig> = (
  config: TConfig,
  helpers: ContainerQueryBuilderHelpers
) => void;

type ContainerQueryBuilderOptions<TConfig> = {
  emitBase: ContainerQueryExtensionHandler<TConfig>;
  emitExtensions?: ContainerQueryExtensionHandler<TConfig>;
  resolveType?: (config: TConfig) => "all" | "print" | "screen" | undefined;
  config?: ContainerQueryBuilderConfig;
};

export const formatContainerQueryValue = (
  value: ContainerQueryFeatureValue
): string => (hasCssMethod(value) ? value.css() : String(value));

type ContainerQueryRangeOperator = "<" | "<=";
type ContainerQueryRangeMode = "min" | "max";

type ContainerQueryRangeOptions = {
  mode?: ContainerQueryRangeMode;
  inclusive?: boolean;
};

export const buildContainerComparison = <TValue>(
  comparison: ComparisonValue<TValue>
): CSSComparison<TValue> => comparison;

export const buildContainerRange = <TValue>(
  min: TValue,
  max: TValue,
  options: ContainerQueryRangeOptions = {}
): CSSRange<TValue> => {
  const mode = options.mode ?? "min";
  const operator: ContainerQueryRangeOperator =
    options.inclusive === false ? "<" : "<=";

  if (mode === "max") {
    return { min, max, maxOperator: operator } as CSSRange<TValue>;
  }

  return { min, max, minOperator: operator } as CSSRange<TValue>;
};

export const buildContainerQueryStringFromParts = (parts: string[]): string =>
  parts.join(" and ");

export const formatContainerQueryComparison = (
  name: string,
  operator: string,
  value: ContainerQueryFeatureValue
): string => {
  return `(${name} ${operator} ${formatContainerQueryValue(value)})`;
};

export const createContainerQueryFeatureEmitter =
  (parts: string[]): ContainerQueryFeatureEmitter =>
  (name, value) => {
    parts.push(`(${name}: ${formatContainerQueryValue(value)})`);
  };

export const createContainerQueryConditionEmitter =
  (parts: string[]): ContainerQueryConditionEmitter =>
  (condition) => {
    parts.push(condition);
  };

type ContainerQueryFeatureEmitterOptions = {
  emitted?: Set<string>;
  lintingMode?: ContainerQueryLintingMode;
};

export const createContainerQueryFeatureEmitterWithTracking = (
  parts: string[],
  options: ContainerQueryFeatureEmitterOptions = {}
): ContainerQueryFeatureEmitter => {
  const { emitted, lintingMode = "throw" } = options;
  return (name, value) => {
    if (emitted?.has(name)) {
      if (lintingMode === "throw") {
        throw new Error(
          `Container query feature "${name}" was emitted more than once.`
        );
      }
      if (lintingMode === "log") {
        console.warn(
          `Container query feature "${name}" was emitted more than once; using the latest value.`
        );
      }
    }
    emitted?.add(name);
    parts.push(`(${name}: ${formatContainerQueryValue(value)})`);
  };
};

export const createContainerQueryBuilder = <TConfig>(
  options: ContainerQueryBuilderOptions<TConfig>
) => {
  return (config: TConfig): string => {
    const parts: string[] = [];
    const emittedFeatures = new Set<string>();
    const helpers: ContainerQueryBuilderHelpers = {
      addFeature: createContainerQueryFeatureEmitterWithTracking(parts, {
        emitted: emittedFeatures,
        lintingMode: options.config?.errorHandling?.lintingMode ?? "throw",
      }),
      addCondition: createContainerQueryConditionEmitter(parts),
      config: options.config ?? {},
    };

    options.emitBase(config, helpers);
    options.emitExtensions?.(config, helpers);

    return buildContainerQueryStringFromParts(parts);
  };
};

export const applyContainerQueryValidation = <TConfig>(
  config: TConfig,
  helpers: ContainerQueryBuilderHelpers,
  validator?: ContainerQueryValidator<TConfig>,
  context?: string
): boolean => {
  if (!validator) return true;
  const normalized = normalizeValidationResult(validator(config));
  if (normalized.valid) return true;

  const mode = helpers.config.errorHandling?.invalidValueMode ?? "throw";
  if (mode === "log") {
    const suffix = normalized.message ? `: ${normalized.message}` : "";
    const prefix = context
      ? `Container query ${context} validation failed`
      : "Container query validation failed";
    console.warn(`${prefix}${suffix}`);
  }
  if (mode === "allow") return true;
  if (mode === "log") return true;

  const suffix = normalized.message ? `: ${normalized.message}` : "";
  const prefix = context
    ? `Container query ${context} validation failed`
    : "Container query validation failed";
  throw new Error(`${prefix}${suffix}`);
};
