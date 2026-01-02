import { describe, expect, it, vi } from 'vitest';
import type {
  buildMediaQueryFromFeatures,
  buildMediaQueryString,
  createMediaQueryBuilder,
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitResolutionFeatures,
  mediaQueryFactory,
} from '../../../src/mediaQueries';
import type {
  MediaQueryBuilderHelpers,
  MediaQueryValidationResult,
} from '../../../src/mediaQueries/helpers';
import type { IRatio, IMeasurement } from '../../../src/core';
import type { StyleRule } from '../../../src/mediaQueries/types';
import type { IMediaQueryProps } from '../../../src/mediaQueries/mediaQueries';
import type {
  IMediaQueryCustomFeatures,
  IMediaQueryDimensions,
  IMediaQueryResolutionRange,
} from '../../../src/mediaQueries/modules';

type MeasurementLike = IMeasurement;

type MediaQueriesApi = {
  buildMediaQueryFromFeatures: typeof buildMediaQueryFromFeatures;
  createMediaQueryBuilder: typeof createMediaQueryBuilder;
  buildMediaQueryString: typeof buildMediaQueryString;
  emitDimensionsFeatures: typeof emitDimensionsFeatures;
  emitCustomFeatures: typeof emitCustomFeatures;
  emitResolutionFeatures: typeof emitResolutionFeatures;
  mediaQueryFactory: typeof mediaQueryFactory;
  mDpi: (value: number) => MeasurementLike;
  mPx: (value: number) => MeasurementLike;
  r: (numerator: number, denominator?: number) => IRatio;
  styleRuleSample?: StyleRule;
};

export const runMediaQueryTests = (
  label: string,
  api: MediaQueriesApi,
): void => {
  describe(`mediaQueries (${label})`, () => {
    it('builds a min-width query with the default media type', () => {
      const result = api.buildMediaQueryString({ minWidth: api.mPx(480) });
      expect(result).toBe('screen and (min-width: 480px)');
    });

    it('builds a max-width query', () => {
      const result = api.buildMediaQueryString({ maxWidth: api.mPx(1024) });
      expect(result).toBe('screen and (max-width: 1024px)');
    });

    it('builds a min/max width range query', () => {
      const result = api.buildMediaQueryString({
        minWidth: api.mPx(480),
        maxWidth: api.mPx(1024),
      });
      expect(result).toBe(
        'screen and (min-width: 480px) and (max-width: 1024px)',
      );
    });

    it('builds a min/max height range query', () => {
      const result = api.buildMediaQueryString({
        minHeight: api.mPx(720),
        maxHeight: api.mPx(900),
      });
      expect(result).toBe(
        'screen and (min-height: 720px) and (max-height: 900px)',
      );
    });

    it('builds an aspect ratio query with min and max values', () => {
      const result = api.buildMediaQueryString({
        aspectRatio: api.r(16, 9),
        minAspectRatio: api.r(4, 3),
        maxAspectRatio: api.r(21, 9),
      });
      expect(result).toBe(
        'screen and (aspect-ratio: 16/9) and (min-aspect-ratio: 4/3) and (max-aspect-ratio: 21/9)',
      );
    });

    it('rejects aspect ratio values that are not created with r()', () => {
      expect(() =>
        api.buildMediaQueryString({
          aspectRatio: '16/9' as unknown as IRatio,
        }),
      ).toThrow(/aspectRatio must be a ratio created with r\(\)/);
      expect(() =>
        api.buildMediaQueryString({
          minAspectRatio: '4/3' as unknown as IRatio,
        }),
      ).toThrow(/minAspectRatio must be a ratio created with r\(\)/);
      expect(() =>
        api.buildMediaQueryString({
          maxAspectRatio: '21/9' as unknown as IRatio,
        }),
      ).toThrow(/maxAspectRatio must be a ratio created with r\(\)/);
    });

    it('builds a dimensions query with width and orientation', () => {
      const result = api.buildMediaQueryString({
        width: api.mPx(600),
        minHeight: api.mPx(320),
        orientation: 'landscape',
      });
      expect(result).toBe(
        'screen and (width: 600px) and (min-height: 320px) and (orientation: landscape)',
      );
    });

    it('builds a resolution range query', () => {
      const result = api.buildMediaQueryString({
        minResolution: api.mDpi(96),
        maxResolution: api.mDpi(192),
      });
      expect(result).toBe(
        'screen and (min-resolution: 96dpi) and (max-resolution: 192dpi)',
      );
    });

    it('builds an exact resolution query', () => {
      const result = api.buildMediaQueryString({
        resolutionValue: api.mDpi(144),
      });
      expect(result).toBe('screen and (resolution: 144dpi)');
    });

    it('builds a query from a feature map', () => {
      const result = api.buildMediaQueryFromFeatures({
        'min-width': api.mPx(720),
      });
      expect(result).toBe('screen and (min-width: 720px)');
    });

    it('rejects empty custom feature names', () => {
      expect(() =>
        api.buildMediaQueryString({
          customFeatures: {
            '   ': api.mPx(320),
          },
        }),
      ).toThrow('Custom feature name must be non-empty.');
    });

    it('rejects invalid custom feature values', () => {
      expect(() =>
        api.buildMediaQueryString({
          customFeatures: {
            'custom-feature': ({ bad: true } as unknown as IMeasurement),
          },
        }),
      ).toThrow('Custom feature "custom-feature" must be a primitive or a measurement.');
    });

    it('rejects invalid aspect ratio formats', () => {
      const strictBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { invalidValueMode: 'throw' } },
      });
      expect(() =>
        strictBuilder({ aspectRatio: api.r(0, 1) }),
      ).toThrow(
        /aspectRatio must be a valid ratio greater than 0.*code=CALIPERS_E_ASSERT_CONDITION/,
      );

      expect(() =>
        strictBuilder({ minAspectRatio: api.r(1, -2) }),
      ).toThrow(
        /minAspectRatio must be a valid ratio greater than 0.*code=CALIPERS_E_ASSERT_CONDITION/,
      );
    });

    it('mixes core and interaction features', () => {
      const result = api.buildMediaQueryString({
        minWidth: api.mPx(640),
        hover: 'hover',
      });
      expect(result).toBe('screen and (min-width: 640px) and (hover: hover)');
    });

    it('mixes multiple core feature groups', () => {
      const result = api.buildMediaQueryString({
        minWidth: api.mPx(640),
        minHeight: api.mPx(480),
        minResolution: api.mDpi(96),
        orientation: 'portrait',
      });
      expect(result).toBe(
        'screen and (min-width: 640px) and (min-height: 480px) and (orientation: portrait) and (min-resolution: 96dpi)',
      );
    });

    it('mixes multiple custom feature groups', () => {
      const result = api.buildMediaQueryString({
        customFeatures: {
          'prefers-feature-x': 'enabled',
          'min-custom-width': api.mPx(720),
          'custom-contrast': 'high',
          'custom-level': 2,
        },
      });
      expect(result).toBe(
        'screen and (prefers-feature-x: enabled) and (min-custom-width: 720px) and (custom-contrast: high) and (custom-level: 2)',
      );
    });

    it('mixes custom features with core features', () => {
      const result = api.buildMediaQueryString({
        minWidth: api.mPx(800),
        minHeight: api.mPx(600),
        minResolution: api.mDpi(120),
        orientation: 'landscape',
        customFeatures: {
          'prefers-feature-x': 'enabled',
          'max-custom-width': api.mPx(1200),
          'custom-tier': 3,
        },
      });
      expect(result).toBe(
        'screen and (min-width: 800px) and (min-height: 600px) and (orientation: landscape) and (min-resolution: 120dpi) and (prefers-feature-x: enabled) and (max-custom-width: 1200px) and (custom-tier: 3)',
      );
    });

    it('respects invalid value mode for validation', () => {
      const allowBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { invalidValueMode: 'allow' } },
      });
      const logBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { invalidValueMode: 'log' } },
      });
      const throwBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { invalidValueMode: 'throw' } },
      });

      const invalid = { aspectRatio: api.r(0, 1) };
      expect(() => allowBuilder(invalid)).not.toThrow();
      expect(() => logBuilder(invalid)).not.toThrow();
      expect(() => throwBuilder(invalid)).toThrow(
        /aspectRatio must be a valid ratio greater than 0.*code=CALIPERS_E_ASSERT_CONDITION/,
      );
    });

    it('respects linting mode for redundancy', () => {
      const allowBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { lintingMode: 'allow' } },
      });
      const logBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { lintingMode: 'log' } },
      });
      const throwBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { lintingMode: 'throw' } },
      });

      const redundant = { width: api.mPx(640), minWidth: api.mPx(320) };
      expect(() => allowBuilder(redundant)).not.toThrow();
      expect(() => logBuilder(redundant)).not.toThrow();
      expect(() => throwBuilder(redundant)).toThrow(
        'width should not be combined with minWidth or maxWidth',
      );
    });

    it('respects linting mode for duplicate emissions from custom features', () => {
      const makeBuilder = (lintingMode: 'allow' | 'log' | 'throw') =>
        api.createMediaQueryBuilder({
          emitBase: (props: IMediaQueryCustomFeatures, helpers) => {
            helpers.addFeature('min-width', api.mPx(320));
            api.emitCustomFeatures(props, helpers);
          },
          config: { errorHandling: { lintingMode } },
        });
      const allowBuilder = makeBuilder('allow');
      const logBuilder = makeBuilder('log');
      const throwBuilder = makeBuilder('throw');

      const overlapping = {
        customFeatures: {
          'min-width': api.mPx(480),
        },
      };

      expect(() => allowBuilder(overlapping)).not.toThrow();
      expect(() => logBuilder(overlapping)).not.toThrow();
      expect(() => throwBuilder(overlapping)).toThrow(
        'Media query feature "min-width" was emitted more than once.',
      );
    });

    it('respects linting mode for explicit duplicate emissions', () => {
      const makeBuilder = (lintingMode: 'allow' | 'log' | 'throw') =>
        api.createMediaQueryBuilder({
          emitBase: (_props, helpers) => {
            helpers.addFeature('min-width', api.mPx(320));
            helpers.addFeature('min-width', api.mPx(480));
          },
          config: { errorHandling: { lintingMode } },
        });

      expect(() => makeBuilder('allow')({})).not.toThrow();
      expect(() => makeBuilder('log')({})).not.toThrow();
      expect(() => makeBuilder('throw')({})).toThrow(
        'Media query feature "min-width" was emitted more than once.',
      );
    });

    it('covers mixed validation and linting modes', () => {
      const modes = ['allow', 'log', 'throw'] as const;

      modes.forEach((invalidValueMode) => {
        modes.forEach((lintingMode) => {
          const builder = api.createMediaQueryBuilder({
            emitBase: api.emitDimensionsFeatures,
            config: { errorHandling: { invalidValueMode, lintingMode } },
          });

          const props = {
            aspectRatio: api.r(0, 1),
            width: api.mPx(640),
            minWidth: api.mPx(320),
          };

          if (lintingMode === 'throw') {
            expect(() => builder(props)).toThrow(
              'width should not be combined with minWidth or maxWidth',
            );
            return;
          }

          if (invalidValueMode === 'throw') {
            expect(() => builder(props)).toThrow(
              /aspectRatio must be a valid ratio greater than 0.*code=CALIPERS_E_ASSERT_CONDITION/,
            );
            return;
          }

          expect(() => builder(props)).not.toThrow();
        });
      });
    });

    it('does not throw in log mode when validation fails', () => {
      const logBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        config: { errorHandling: { invalidValueMode: 'log' } },
      });

      expect(() => logBuilder({ aspectRatio: api.r(0, 1) })).not.toThrow();
    });

    it('handles multiple factory instances with independent configs', () => {
      const invalidModes = ['allow', 'log', 'throw'] as const;
      const lintModes = ['allow', 'log', 'throw'] as const;

      const props = {
        aspectRatio: api.r(0, 1),
        width: api.mPx(640),
        minWidth: api.mPx(320),
      };

      invalidModes.forEach((invalidValueMode) => {
        lintModes.forEach((lintingMode) => {
          const builder = api.createMediaQueryBuilder({
            emitBase: api.emitDimensionsFeatures,
            config: { errorHandling: { invalidValueMode, lintingMode } },
          });

          if (lintingMode === 'throw') {
            expect(() => builder(props)).toThrow(
              'width should not be combined with minWidth or maxWidth',
            );
            return;
          }

          if (invalidValueMode === 'throw') {
            expect(() => builder(props)).toThrow(
              /aspectRatio must be a valid ratio greater than 0.*code=CALIPERS_E_ASSERT_CONDITION/,
            );
            return;
          }

          expect(() => builder(props)).not.toThrow();
        });
      });
    });

    it('respects factory config when using resolution module alone', () => {
      const throwBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitResolutionFeatures,
        config: { errorHandling: { invalidValueMode: 'throw' } },
      });
      const logBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitResolutionFeatures,
        config: { errorHandling: { invalidValueMode: 'log' } },
      });

      expect(() =>
        throwBuilder({ minResolution: api.mDpi(-1) }),
      ).toThrow(
        /minResolution must be greater than 0.*code=CALIPERS_E_ASSERT_CONDITION/,
      );
      expect(() =>
        logBuilder({ minResolution: api.mDpi(-1) }),
      ).not.toThrow();
    });

    it('respects factory config when using custom module alone', () => {
      const throwBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitCustomFeatures,
        config: { errorHandling: { lintingMode: 'throw' } },
      });
      const allowBuilder = api.createMediaQueryBuilder({
        emitBase: api.emitCustomFeatures,
        config: { errorHandling: { lintingMode: 'allow' } },
      });

      const overlapping = {
        customFeatures: {
          'min-width': api.mPx(320),
        },
      };

      const emitWithDuplicate = (
        props: IMediaQueryCustomFeatures,
        helpers: MediaQueryBuilderHelpers,
      ) => {
        api.emitCustomFeatures(props, helpers);
        api.emitCustomFeatures(props, helpers);
      };

      const allowDuplicateBuilder = api.createMediaQueryBuilder({
        emitBase: emitWithDuplicate,
        config: { errorHandling: { lintingMode: 'allow' } },
      });
      const throwDuplicateBuilder = api.createMediaQueryBuilder({
        emitBase: emitWithDuplicate,
        config: { errorHandling: { lintingMode: 'throw' } },
      });

      expect(() => allowDuplicateBuilder(overlapping)).not.toThrow();
      expect(() => throwDuplicateBuilder(overlapping)).toThrow(
        'Media query feature "min-width" was emitted more than once.',
      );

      expect(() => allowBuilder(overlapping)).not.toThrow();
      expect(() => throwBuilder(overlapping)).not.toThrow();
    });

    it('builds an interaction query', () => {
      const result = api.buildMediaQueryString({
        hover: 'hover',
        anyHover: 'none',
        pointer: 'coarse',
        anyPointer: 'fine',
        update: 'fast',
      });
      expect(result).toBe(
        'screen and (hover: hover) and (any-hover: none) and (pointer: coarse) and (any-pointer: fine) and (update: fast)',
      );
    });

    it('builds a preferences query', () => {
      const result = api.buildMediaQueryString({
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        reducedData: 'reduce',
        contrast: 'more',
        forcedColors: 'active',
      });
      expect(result).toBe(
        'screen and (prefers-color-scheme: dark) and (prefers-reduced-motion: reduce) and (prefers-reduced-data: reduce) and (prefers-contrast: more) and (forced-colors: active)',
      );
    });

    it('builds a display query', () => {
      const result = api.buildMediaQueryString({
        colorGamut: 'p3',
        dynamicRange: 'high',
        invertedColors: 'inverted',
      });
      expect(result).toBe(
        'screen and (color-gamut: p3) and (dynamic-range: high) and (inverted-colors: inverted)',
      );
    });

    it('builds an environment query', () => {
      const result = api.buildMediaQueryString({
        scripting: 'enabled',
        overflowBlock: 'scroll',
        overflowInline: 'scroll',
      });
      expect(result).toBe(
        'screen and (scripting: enabled) and (overflow-block: scroll) and (overflow-inline: scroll)',
      );
    });

    it('defaults to full module coverage when modules are omitted', () => {
      const queries: Record<string, IMediaQueryProps> = {
        mixed: {
          minWidth: api.mPx(640),
          minHeight: api.mPx(480),
          minResolution: api.mDpi(96),
          hover: 'hover',
          colorScheme: 'dark',
          scripting: 'enabled',
          customFeatures: { 'custom-flag': 'on' },
        },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'default-modules',
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      const result = factory({
        mixed: { padding: '8px' },
      });

      expect(result).toEqual({
        '@media': {
          'screen and (min-width: 640px) and (min-height: 480px) and (min-resolution: 96dpi) and (hover: hover) and (prefers-color-scheme: dark) and (scripting: enabled) and (custom-flag: on)':
            { padding: '8px' },
        },
      });
    });

    it('errors with a module hint when a feature is unsupported', () => {
      const queries = {
        onlyCore: {
          minWidth: api.mPx(640),
          hover: 'hover',
        },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'core-only',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "core-only" received unsupported feature "hover". Add "interaction" to modules.',
      );
    });

    it('runs custom validators with invalidValueMode', () => {
      const queries = {
        base: {
          minWidth: api.mPx(640),
        },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'custom-validator',
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
          custom: {
            key: 'guard',
            validator: () => 'nope',
          },
        },
      });

      expect(() => factory({ base: { padding: '8px' } })).toThrow(
        'Media query factory "custom-validator" custom validator "guard" failed: nope',
      );
    });

    it('runs custom linters with lintingMode', () => {
      const queries = {
        base: {
          minWidth: api.mPx(640),
        },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'custom-linter',
          errorHandling: { invalidValueMode: 'allow', lintingMode: 'throw' },
          custom: {
            key: 'guard',
            linter: () => 'flagged',
          },
        },
      });

      expect(() => factory({ base: { padding: '8px' } })).toThrow(
        'Media query factory "custom-linter" custom linter "guard" flagged: flagged',
      );
    });

    it('requires the custom module when customFeatures are used', () => {
      const queries = {
        coreOnly: {
          minWidth: api.mPx(640),
          customFeatures: { 'custom-flag': 'on' },
        },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'no-custom-module',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      expect(() => factory({ coreOnly: { padding: '8px' } })).toThrow(
        'Media query factory "no-custom-module" received unsupported feature "customFeatures". Add "custom" to modules.',
      );
    });

    it('defaults invalidValueMode to throw for factory guard failures', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), hover: 'hover' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'guard-default',
          modules: ['core'],
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "guard-default" received unsupported feature "hover". Add "interaction" to modules.',
      );
    });

    it('defaults invalidValueMode to throw for custom validator failures', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'validator-default',
          custom: {
            key: 'guard',
            validator: () => 'nope',
          },
        },
      });

      expect(() => factory({ base: { padding: '8px' } })).toThrow(
        'Media query factory "validator-default" custom validator "guard" failed: nope',
      );
    });

    it('keeps low-level builder behavior when used directly', () => {
      const builder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
      });

      const result = builder({
        width: api.mPx(640),
        minHeight: api.mPx(480),
        orientation: 'portrait',
      });

      expect(result).toBe(
        'screen and (width: 640px) and (min-height: 480px) and (orientation: portrait)',
      );
    });

    it('preserves direct builder media type resolution', () => {
      const builder = api.createMediaQueryBuilder({
        emitBase: api.emitDimensionsFeatures,
        resolveType: () => 'print',
      });

      const result = builder({
        width: api.mPx(640),
      });

      expect(result).toBe('print and (width: 640px)');
    });

    it('guards interaction features when module is missing', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), hover: 'hover' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'no-interaction',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "no-interaction" received unsupported feature "hover". Add "interaction" to modules.',
      );
    });

    it('guards preferences features when module is missing', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), colorScheme: 'dark' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'no-preferences',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "no-preferences" received unsupported feature "colorScheme". Add "preferences" to modules.',
      );
    });

    it('guards display features when module is missing', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), colorGamut: 'p3' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'no-display',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "no-display" received unsupported feature "colorGamut". Add "display" to modules.',
      );
    });

    it('guards environment features when module is missing', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), scripting: 'enabled' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'no-environment',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "no-environment" received unsupported feature "scripting". Add "environment" to modules.',
      );
    });

    it('matches output when modules are omitted vs explicitly provided', () => {
      const queries: Record<string, IMediaQueryProps> = {
        mixed: {
          minWidth: api.mPx(640),
          minHeight: api.mPx(480),
          minResolution: api.mDpi(96),
          hover: 'hover',
          colorScheme: 'dark',
          scripting: 'enabled',
          customFeatures: { 'custom-flag': 'on' },
        },
      };

      const factoryDefault = api.mediaQueryFactory({
        queries,
        config: {
          label: 'default-modules-parity',
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      const factoryExplicit = api.mediaQueryFactory({
        queries,
        config: {
          label: 'explicit-modules-parity',
          modules: [
            'core',
            'dimensions',
            'resolution',
            'interaction',
            'preferences',
            'display',
            'environment',
            'custom',
          ],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'log' },
        },
      });

      const styles = {
        mixed: { padding: '8px' },
      };

      expect(factoryDefault(styles)).toEqual(factoryExplicit(styles));
    });

    it('uses invalidValueMode log for module guard failures', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), hover: 'hover' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'guard-log',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'log', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).not.toThrow();
    });

    it('uses invalidValueMode allow for module guard failures', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), hover: 'hover' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'guard-allow',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'allow', lintingMode: 'log' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).not.toThrow();
    });

    it('defaults lintingMode to throw for custom linter failures', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'linter-default',
          errorHandling: { invalidValueMode: 'allow' },
          custom: {
            key: 'guard',
            linter: () => 'flagged',
          },
        },
      });

      expect(() => factory({ base: { padding: '8px' } })).toThrow(
        'Media query factory "linter-default" custom linter "guard" flagged: flagged',
      );
    });

    it('no-ops when factory is called without matching styles', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'no-op',
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'throw' },
          custom: {
            key: 'guard',
            validator: () => 'nope',
            linter: () => 'flagged',
          },
        },
      });

      expect(factory({})).toEqual({ '@media': {} });
      expect(factory({ base: undefined })).toEqual({ '@media': {} });
    });

    it('logs warnings when invalidValueMode is log for guard failures', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640), hover: 'hover' },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'guard-log-warning',
          modules: ['core'],
          errorHandling: { invalidValueMode: 'log', lintingMode: 'log' },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      factory({ onlyCore: { padding: '8px' } });
      expect(warnSpy).toHaveBeenCalledWith(
        'Media query factory "guard-log-warning" received unsupported feature "hover". Add "interaction" to modules.',
      );
      warnSpy.mockRestore();
    });

    it('logs warnings when lintingMode is log for duplicate emissions', () => {
      const builder = api.createMediaQueryBuilder({
        emitBase: (_props, helpers) => {
          helpers.addFeature('min-width', api.mPx(320));
          helpers.addFeature('min-width', api.mPx(480));
        },
        config: { errorHandling: { lintingMode: 'log' } },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      builder({});
      expect(warnSpy).toHaveBeenCalledWith(
        'Media query feature "min-width" was emitted more than once; using the latest value.',
      );
      warnSpy.mockRestore();
    });

    it('uses invalidValueMode log for custom validator failures', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'validator-log',
          errorHandling: { invalidValueMode: 'log', lintingMode: 'log' },
          custom: {
            key: 'guard',
            validator: () => 'nope',
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => factory({ base: { padding: '8px' } })).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        'Media query factory "validator-log" custom validator "guard" failed: nope',
      );
      warnSpy.mockRestore();
    });

    it('uses invalidValueMode allow for custom validator failures', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'validator-allow',
          errorHandling: { invalidValueMode: 'allow', lintingMode: 'log' },
          custom: {
            key: 'guard',
            validator: () => 'nope',
          },
        },
      });

      expect(() => factory({ base: { padding: '8px' } })).not.toThrow();
    });

    it('uses lintingMode log for custom linter failures', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'linter-log',
          errorHandling: { invalidValueMode: 'allow', lintingMode: 'log' },
          custom: {
            key: 'guard',
            linter: () => 'flagged',
          },
        },
      });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => factory({ base: { padding: '8px' } })).not.toThrow();
      expect(warnSpy).toHaveBeenCalledWith(
        'Media query factory "linter-log" custom linter "guard" flagged: flagged',
      );
      warnSpy.mockRestore();
    });

    it('uses lintingMode allow for custom linter failures', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'linter-allow',
          errorHandling: { invalidValueMode: 'allow', lintingMode: 'allow' },
          custom: {
            key: 'guard',
            linter: () => 'flagged',
          },
        },
      });

      expect(() => factory({ base: { padding: '8px' } })).not.toThrow();
    });

    it('ignores styles for keys not present in queries', () => {
      const queries = {
        base: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'unknown-keys',
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'throw' },
        },
      });

      const styles = {
        base: { padding: '8px' },
        extra: { color: 'red' },
      } as Record<string, StyleRule>;

      const result = factory(styles);

      expect(result).toEqual({
        '@media': {
          'screen and (min-width: 640px)': { padding: '8px' },
        },
      });
    });

    it('handles empty modules list by rejecting all features', () => {
      const queries = {
        onlyCore: { minWidth: api.mPx(640) },
      };

      const factory = api.mediaQueryFactory({
        queries,
        config: {
          label: 'empty-modules',
          modules: [],
          errorHandling: { invalidValueMode: 'throw', lintingMode: 'throw' },
        },
      });

      expect(() => factory({ onlyCore: { padding: '8px' } })).toThrow(
        'Media query factory "empty-modules" received unsupported feature "minWidth". Add "core" to modules.',
      );
    });
  });
};
