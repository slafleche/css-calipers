import type { IMeasurement } from '../core';
import { hasCssMethod } from '../core';
import type { ValidationResult } from '../validation';

export type ContainerQueryValidationResult = ValidationResult;

export type ContainerQueryValidator<TConfig> = (
  config: TConfig,
) => ContainerQueryValidationResult;

type ContainerQueryFeatureValue = string | number | IMeasurement;

type ContainerQueryFeatureEmitter = (
  name: string,
  value: ContainerQueryFeatureValue,
) => void;

export type ContainerQueryInvalidValueMode = 'allow' | 'log' | 'throw';
export type ContainerQueryLintingMode = 'allow' | 'log' | 'throw';

export type ContainerQueryBuilderConfig = {
  errorHandling?: {
    invalidValueMode?: ContainerQueryInvalidValueMode;
    lintingMode?: ContainerQueryLintingMode;
  };
};

export interface ContainerQueryBuilderHelpers {
  addFeature: ContainerQueryFeatureEmitter;
  config: ContainerQueryBuilderConfig;
}


export type ContainerQueryExtensionHandler<TConfig> = (
  config: TConfig,
  helpers: ContainerQueryBuilderHelpers,
) => void;

type ContainerQueryBuilderOptions<TConfig> = {
  emitBase: ContainerQueryExtensionHandler<TConfig>;
  emitExtensions?: ContainerQueryExtensionHandler<TConfig>;
  resolveType?: (config: TConfig) => 'all' | 'print' | 'screen' | undefined;
  config?: ContainerQueryBuilderConfig;
};

export const formatContainerQueryValue = (
  value: ContainerQueryFeatureValue,
): string => (hasCssMethod(value) ? value.css() : String(value));

// export const buildContainerQueryStringFromParts = (
//   parts: string[],
// ): string => (parts.length ? `${containerType} and ${parts.join(' and ')}` : containerType);

export const createContainerQueryFeatureEmitter = (
  parts: string[],
): ContainerQueryFeatureEmitter =>
  (name, value) => {
    parts.push(`(${name}: ${formatContainerQueryValue(value)})`);
  };

type ContainerQueryFeatureEmitterOptions = {
  emitted?: Set<string>;
  lintingMode?: ContainerQueryLintingMode;
};

// export const createMediaQueryFeatureEmitterWithTracking = (
//   parts: string[],
//   options: MediaQueryFeatureEmitterOptions = {},
// ): MediaQueryFeatureEmitter => {
//   const { emitted, lintingMode = 'throw' } = options;
//   return (name, value) => {
//     if (emitted?.has(name)) {
//       if (lintingMode === 'throw') {
//         throw new Error(
//           `Media query feature "${name}" was emitted more than once.`,
//         );
//       }
//       if (lintingMode === 'log') {
//         console.warn(
//           `Media query feature "${name}" was emitted more than once; using the latest value.`,
//         );
//       }
//     }
//     emitted?.add(name);
//     parts.push(`(${name}: ${formatMediaQueryValue(value)})`);
//   };
// };

// export const createMediaQueryBuilder = <TConfig>(
//   options: MediaQueryBuilderOptions<TConfig>,
// ) => {
//   return (config: TConfig): string => {
//     const parts: string[] = [];
//     const emittedFeatures = new Set<string>();
//     const helpers: MediaQueryBuilderHelpers = {
//       addFeature: createMediaQueryFeatureEmitterWithTracking(parts, {
//         emitted: emittedFeatures,
//         lintingMode: options.config?.errorHandling?.lintingMode ?? 'throw',
//       }),
//       config: options.config ?? {},
//     };

//     options.emitBase(config, helpers);
//     options.emitExtensions?.(config, helpers);

//     const mediaType = options.resolveType?.(config) ?? 'screen';
//     return buildMediaQueryStringFromParts(mediaType, parts);
//   };
// };

// export const applyMediaQueryValidation = <TConfig>(
  // config: TConfig,
  // helpers: MediaQueryBuilderHelpers,
  // validator?: MediaQueryValidator<TConfig>,
  // context?: string,
// ): boolean => {
  // if (!validator) return true;
  // const normalized = normalizeValidationResult(validator(config));
  // if (normalized.valid) return true;

  // const mode = helpers.config.errorHandling?.invalidValueMode ?? 'throw';
  // if (mode === 'log') {
  //   const suffix = normalized.message ? `: ${normalized.message}` : '';
  //   const prefix = context
  //     ? `Media query ${context} validation failed`
  //     : 'Media query validation failed';
  //   console.warn(`${prefix}${suffix}`);
  // }
  // if (mode === 'allow') return true;
  // if (mode === 'log') return true;

  // const suffix = normalized.message ? `: ${normalized.message}` : '';
  // const prefix = context
  //   ? `Media query ${context} validation failed`
  //   : 'Media query validation failed';
  // throw new Error(`${prefix}${suffix}`);
// };

// export const buildMediaQueryFromFeatures = (
  // features: Record<string, MediaQueryFeatureValue>,
  // mediaType: 'all' | 'print' | 'screen' = 'screen',
// ): string => {
  // const parts: string[] = [];
  // const addFeature = createMediaQueryFeatureEmitterWithTracking(parts, {
  //   emitted: new Set<string>(),
  //   lintingMode: 'throw',
  // });

  // Object.entries(features).forEach(([name, value]) => {
  //   if (value === undefined || value === null) return;
  //   addFeature(name, value);
  // });

  // return buildMediaQueryStringFromParts(mediaType, parts);
// };
