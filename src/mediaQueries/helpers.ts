import type { IMeasurement, IRatio } from '../core';
import { hasCssMethod } from '../core';
import type { ValidationResult } from '../validation';
import { normalizeValidationResult } from '../validation';
import { normalizeToArray } from '../internal/normalizeToArray';

type MediaQueryFeatureEntry = string | number | IMeasurement | IRatio;
type MediaQueryFeatureValue = MediaQueryFeatureEntry | MediaQueryFeatureEntry[];

type MediaQueryFeatureEmitter = (
  name: string,
  value: MediaQueryFeatureEntry,
) => void;

export type MediaQueryInvalidValueMode = 'allow' | 'log' | 'throw';
export type MediaQueryLintingMode = 'allow' | 'log' | 'throw';

export type MediaQueryBuilderConfig = {
  errorHandling?: {
    invalidValueMode?: MediaQueryInvalidValueMode;
    lintingMode?: MediaQueryLintingMode;
  };
  allowQueryArrays?: boolean;
};

export interface MediaQueryBuilderHelpers {
  addFeature: MediaQueryFeatureEmitter;
  addFeatureUnsafe: MediaQueryFeatureEmitter;
  config: MediaQueryBuilderConfig;
}

export type MediaQueryValidationResult = ValidationResult;

export type MediaQueryValidator<TConfig> = (
  config: TConfig,
) => MediaQueryValidationResult;

export type MediaQueryExtensionHandler<TConfig> = (
  config: TConfig,
  helpers: MediaQueryBuilderHelpers,
) => void;

type MediaQueryBuilderOptions<TConfig> = {
  emitBase: MediaQueryExtensionHandler<TConfig>;
  emitExtensions?: MediaQueryExtensionHandler<TConfig>;
  resolveType?: (config: TConfig) => 'all' | 'print' | 'screen' | undefined;
  config?: MediaQueryBuilderConfig;
};

export const formatMediaQueryValue = (
  value: MediaQueryFeatureEntry,
): string => (hasCssMethod(value) ? value.css() : String(value));

export const buildMediaQueryStringFromParts = (
  mediaType: 'all' | 'print' | 'screen',
  parts: string[],
): string => (parts.length ? `${mediaType} and ${parts.join(' and ')}` : mediaType);

export const createMediaQueryFeatureEmitter = (
  parts: string[],
): MediaQueryFeatureEmitter =>
  (name, value) => {
    parts.push(`(${name}: ${formatMediaQueryValue(value)})`);
  };

type MediaQueryFeatureEmitterOptions = {
  emitted?: Set<string>;
  lintingMode?: MediaQueryLintingMode;
};

export const createMediaQueryFeatureEmitterWithTracking = (
  parts: string[],
  options: MediaQueryFeatureEmitterOptions = {},
): MediaQueryFeatureEmitter => {
  const { emitted, lintingMode = 'throw' } = options;
  return (name, value) => {
    if (emitted?.has(name)) {
      if (lintingMode === 'throw') {
        throw new Error(
          `Media query feature "${name}" was emitted more than once.`,
        );
      }
      if (lintingMode === 'log') {
        console.warn(
          `Media query feature "${name}" was emitted more than once; using the latest value.`,
        );
      }
    }
    emitted?.add(name);
    parts.push(`(${name}: ${formatMediaQueryValue(value)})`);
  };
};

export const createMediaQueryBuilder = <TConfig>(
  options: MediaQueryBuilderOptions<TConfig>,
) => {
  return (config: TConfig): string => {
    const parts: string[] = [];
    const emittedFeatures = new Set<string>();
    const helpers: MediaQueryBuilderHelpers = {
      addFeature: createMediaQueryFeatureEmitterWithTracking(parts, {
        emitted: emittedFeatures,
        lintingMode: options.config?.errorHandling?.lintingMode ?? 'throw',
      }),
      addFeatureUnsafe: createMediaQueryFeatureEmitter(parts),
      config: options.config ?? {},
    };

    options.emitBase(config, helpers);
    options.emitExtensions?.(config, helpers);

    const mediaType = options.resolveType?.(config) ?? 'screen';
    return buildMediaQueryStringFromParts(mediaType, parts);
  };
};

export const applyMediaQueryValidation = <TConfig>(
  config: TConfig,
  helpers: MediaQueryBuilderHelpers,
  validator?: MediaQueryValidator<TConfig>,
  context?: string,
): boolean => {
  if (!validator) return true;
  const normalized = normalizeValidationResult(validator(config));
  if (normalized.valid) return true;

  const mode = helpers.config.errorHandling?.invalidValueMode ?? 'throw';
  if (mode === 'log') {
    const suffix = normalized.message ? `: ${normalized.message}` : '';
    const prefix = context
      ? `Media query ${context} validation failed`
      : 'Media query validation failed';
    console.warn(`${prefix}${suffix}`);
  }
  if (mode === 'allow') return true;
  if (mode === 'log') return true;

  const suffix = normalized.message ? `: ${normalized.message}` : '';
  const prefix = context
    ? `Media query ${context} validation failed`
    : 'Media query validation failed';
  throw new Error(`${prefix}${suffix}`);
};

export const buildMediaQueryFromFeatures = (
  features: Record<string, MediaQueryFeatureValue>,
  mediaType: 'all' | 'print' | 'screen' = 'screen',
): string => {
  const parts: string[] = [];
  const addFeature = createMediaQueryFeatureEmitter(parts);

  Object.entries(features).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    normalizeToArray(value).forEach((entry) => {
      addFeature(name, entry);
    });
  });

  return buildMediaQueryStringFromParts(mediaType, parts);
};
