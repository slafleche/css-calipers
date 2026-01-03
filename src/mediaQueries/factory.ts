import type { ComplexStyleRule, StyleRule } from './types';
import type { MediaQueryBuilderConfig } from './helpers';
import type { IMediaQueryProps } from './mediaQueries';
import { emitCoreFeatures } from './mediaQueries';
import {
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitDisplayFeatures,
  emitEnvironmentFeatures,
  emitInteractionFeatures,
  emitPreferencesFeatures,
  emitResolutionFeatures,
} from './modules';
import {
  buildMediaQueryStringFromLogical,
  createMediaQueryConditionBuilder,
  type MediaQueryLogicalRoot,
} from './logical';
import { MEDIA_QUERY_FEATURE_KEYS } from './featureKeys';
import type {
  MediaQueryModuleId,
  MediaQueryModulePropsMap,
  MediaQueryModulesList,
} from './moduleRegistry';

type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer R) => void
  ? R
  : never;

type ModulesToProps<TModules extends MediaQueryModulesList> =
  UnionToIntersection<MediaQueryModulePropsMap[TModules[number]]>;

type FactoryQueryProps<TModules extends MediaQueryModulesList | undefined> =
  TModules extends MediaQueryModulesList
    ? ModulesToProps<TModules>
    : IMediaQueryProps;

type FactoryQueryInput<TModules extends MediaQueryModulesList | undefined> =
  MediaQueryLogicalRoot<IMediaQueryProps>;

type MediaQueryStyleMap<TQueries> = Partial<
  Record<keyof TQueries, StyleRule>
>;

type CustomHookResult =
  | boolean
  | string
  | null
  | undefined
  | {
      valid: boolean;
      message?: string;
    };

type MediaQueryFactoryCustomHooks = {
  key: string;
  validator?: (props: IMediaQueryProps) => CustomHookResult;
  linter?: (props: IMediaQueryProps) => CustomHookResult;
};

const ALL_MEDIA_QUERY_MODULES: MediaQueryModuleId[] = [
  'core',
  'dimensions',
  'resolution',
  'interaction',
  'preferences',
  'display',
  'environment',
  'custom',
];

const MODULE_KEYS: Record<MediaQueryModuleId, readonly string[]> = {
  core: ['type', 'minWidth', 'maxWidth'],
  dimensions: [
    'width',
    'height',
    'minHeight',
    'maxHeight',
    'aspectRatio',
    'minAspectRatio',
    'maxAspectRatio',
    'orientation',
  ],
  resolution: ['resolutionValue', 'minResolution', 'maxResolution'],
  interaction: ['hover', 'anyHover', 'pointer', 'anyPointer', 'update'],
  preferences: [
    'colorScheme',
    'reducedMotion',
    'reducedData',
    'contrast',
    'forcedColors',
  ],
  display: ['colorGamut', 'dynamicRange', 'invertedColors'],
  environment: ['scripting', 'overflowBlock', 'overflowInline'],
  custom: ['customFeatures'],
};

const MODULE_EMITTERS = {
  core: emitCoreFeatures,
  dimensions: emitDimensionsFeatures,
  resolution: emitResolutionFeatures,
  interaction: emitInteractionFeatures,
  preferences: emitPreferencesFeatures,
  display: emitDisplayFeatures,
  environment: emitEnvironmentFeatures,
  custom: emitCustomFeatures,
};

export type MediaQueryModuleEmitters = typeof MODULE_EMITTERS;

const ALL_MODULE_KEYS: Record<MediaQueryModuleId, readonly string[]> =
  MODULE_KEYS;

const KEY_TO_MODULE: Record<string, MediaQueryModuleId> = Object.fromEntries(
  (Object.keys(ALL_MODULE_KEYS) as MediaQueryModuleId[]).flatMap(
    (moduleId) =>
      ALL_MODULE_KEYS[moduleId].map((key) => [key, moduleId] as const),
  ),
);

const guardUnsupportedProps = (
  props: Record<string, unknown>,
  modules: readonly MediaQueryModuleId[],
  config: MediaQueryBuilderConfig,
  label: string,
): void => {
  const allowed = new Set<string>();

  modules.forEach((moduleId) => {
    ALL_MODULE_KEYS[moduleId].forEach((key) => {
      allowed.add(key);
    });
  });

  Object.keys(props).forEach((key) => {
    if (props[key] === undefined) return;
    if (allowed.has(key)) return;

    const mode = config.errorHandling?.invalidValueMode ?? 'throw';
    const moduleHint = KEY_TO_MODULE[key];
    const moduleSuffix = moduleHint
      ? ` Add "${moduleHint}" to modules.`
      : '';
    const message = `Media query factory "${label}" received unsupported feature "${key}".${moduleSuffix}`;

    if (mode === 'log') {
      console.warn(message);
      return;
    }
    if (mode === 'allow') return;

    throw new Error(message);
  });
};

export type MediaQueryFactoryConfig<
  TModules extends MediaQueryModulesList | undefined = undefined,
  TOutput = ComplexStyleRule
> = MediaQueryBuilderConfig & {
  label: string;
  modules?: TModules;
  output?: (media: ComplexStyleRule) => TOutput;
  custom?: MediaQueryFactoryCustomHooks;
};

const normalizeCustomResult = (
  result: CustomHookResult,
): { valid: boolean; message?: string } => {
  if (result === undefined || result === null) return { valid: true };
  if (typeof result === 'boolean') return { valid: result };
  if (typeof result === 'string') {
    return result ? { valid: false, message: result } : { valid: true };
  }
  return result;
};

const runCustomValidator = <TModules extends MediaQueryModulesList | undefined, TOutput>(
  props: IMediaQueryProps,
  config: MediaQueryFactoryConfig<TModules, TOutput>,
): void => {
  const custom = config.custom;
  if (!custom?.validator) return;

  const normalized = normalizeCustomResult(custom.validator(props));
  if (normalized.valid) return;

  const mode = config.errorHandling?.invalidValueMode ?? 'throw';
  const suffix = normalized.message ? `: ${normalized.message}` : '';
  const message = `Media query factory "${config.label}" custom validator "${custom.key}" failed${suffix}`;

  if (mode === 'log') {
    console.warn(message);
    return;
  }
  if (mode === 'allow') return;

  throw new Error(message);
};

const runCustomLinter = <TModules extends MediaQueryModulesList | undefined, TOutput>(
  props: IMediaQueryProps,
  config: MediaQueryFactoryConfig<TModules, TOutput>,
): void => {
  const custom = config.custom;
  if (!custom?.linter) return;

  const normalized = normalizeCustomResult(custom.linter(props));
  if (normalized.valid) return;

  const mode = config.errorHandling?.lintingMode ?? 'throw';
  const suffix = normalized.message ? `: ${normalized.message}` : '';
  const message = `Media query factory "${config.label}" custom linter "${custom.key}" flagged${suffix}`;

  if (mode === 'log') {
    console.warn(message);
    return;
  }
  if (mode === 'allow') return;

  throw new Error(message);
};

export const createMediaQueryFactory = (
  emitters: MediaQueryModuleEmitters,
) => <
  TModules extends MediaQueryModulesList | undefined,
  TQueries extends Record<string, FactoryQueryInput<TModules>>,
  TOutput = ComplexStyleRule
>(options: {
  queries: TQueries;
  config: MediaQueryFactoryConfig<TModules, TOutput>;
}) => {
  const modules = options.config.modules ?? ALL_MEDIA_QUERY_MODULES;
  const buildBaseCondition = createMediaQueryConditionBuilder({
    emitBase: (props, helpers) => {
      guardUnsupportedProps(
        props as Record<string, unknown>,
        modules,
        options.config,
        options.config.label,
      );
      runCustomValidator(props as IMediaQueryProps, options.config);
      runCustomLinter(props as IMediaQueryProps, options.config);
      modules.forEach((moduleId) => {
        emitters[moduleId](
          props as MediaQueryModulePropsMap[MediaQueryModuleId],
          helpers,
        );
      });
    },
    config: options.config,
  });
  const featureKeySet = new Set<string>(MEDIA_QUERY_FEATURE_KEYS);
  const buildMediaQuery = (props: FactoryQueryInput<TModules>): string =>
    buildMediaQueryStringFromLogical(props, {
      buildBaseCondition: (baseProps) =>
        buildBaseCondition(baseProps as FactoryQueryProps<TModules>),
      resolveType: (baseProps) => (baseProps as IMediaQueryProps).type,
      featureKeys: featureKeySet,
    });

  return (stylesByQuery: MediaQueryStyleMap<TQueries>): TOutput => {
    const result: Record<string, StyleRule> = {};

    (Object.keys(stylesByQuery) as (keyof TQueries)[]).forEach((key) => {
      const styles = stylesByQuery[key];
      const props = options.queries[key];
      if (!styles || !props) return;
      result[buildMediaQuery(props)] = styles;
    });

    const mediaQuery: ComplexStyleRule = {
      '@media': result,
    };

    return options.config.output
      ? options.config.output(mediaQuery)
      : (mediaQuery as TOutput);
  };
};

export const mediaQueryFactory = createMediaQueryFactory(MODULE_EMITTERS);
