import type { IMeasurement } from '../core';
import { hasCssMethod } from '../core';
import type { ValidationResult } from '../validation';
import { normalizeValidationResult } from '../validation';

type MediaQueryFeatureValue = string | number | IMeasurement;

type MediaQueryFeatureEmitter = (
  name: string,
  value: MediaQueryFeatureValue,
) => void;

export type MediaQueryInvalidValueMode = 'allow' | 'log' | 'throw';
export type MediaQueryLintingMode = 'allow' | 'log' | 'throw';

export type MediaQueryBuilderConfig = {
  errorHandling?: {
    invalidValueMode?: MediaQueryInvalidValueMode;
    lintingMode?: MediaQueryLintingMode;
  };
};

export interface MediaQueryBuilderHelpers {
  addFeature: MediaQueryFeatureEmitter;
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
  value: MediaQueryFeatureValue,
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
  const addFeature = createMediaQueryFeatureEmitterWithTracking(parts, {
    emitted: new Set<string>(),
    lintingMode: 'throw',
  });

  Object.entries(features).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    addFeature(name, value);
  });

  return buildMediaQueryStringFromParts(mediaType, parts);
};
