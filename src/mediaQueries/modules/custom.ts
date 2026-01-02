import type { IMeasurement } from '../../core';
import { hasCssMethod } from '../../core';
import type {
  MediaQueryBuilderHelpers,
  MediaQueryValidator,
} from '../helpers';
import { applyMediaQueryValidation } from '../helpers';
import { normalizeToArray } from '../../internal/normalizeToArray';

type MediaQueryFeatureEntry = string | number | IMeasurement;
type MediaQueryFeatureValue =
  | MediaQueryFeatureEntry
  | MediaQueryFeatureEntry[];

export interface IMediaQueryCustomFeatures {
  customFeatures?: Record<string, MediaQueryFeatureValue>;
}

export type MediaQueryCustomFeaturesValidator =
  MediaQueryValidator<IMediaQueryCustomFeatures>;

export const emitCustomFeatures = (
  props: IMediaQueryCustomFeatures,
  helpers: MediaQueryBuilderHelpers,
  options?: {
    allowQueryArrays?: boolean;
  },
  validate?: MediaQueryCustomFeaturesValidator,
): void => {
  if (!applyMediaQueryValidation(props, helpers, validate, 'custom')) {
    return;
  }

  const { addFeatureUnsafe, addFeature } = helpers;
  const allowQueryArrays =
    options?.allowQueryArrays ?? helpers.config.allowQueryArrays ?? true;

  if (!props.customFeatures) return;
  Object.entries(props.customFeatures).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Custom feature name must be non-empty.');
    }
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(
        `Custom feature "${trimmedName}" does not allow arrays.`,
      );
    }

    if (Array.isArray(value)) {
      normalizeToArray(value).forEach((entry) => {
        if (typeof entry === 'object' && !hasCssMethod(entry)) {
          throw new Error(
            `Custom feature "${trimmedName}" must be a primitive or a measurement.`,
          );
        }
        (addFeatureUnsafe ?? addFeature)(trimmedName, entry);
      });
      return;
    }

    if (typeof value === 'object' && !hasCssMethod(value)) {
      throw new Error(
        `Custom feature "${trimmedName}" must be a primitive or a measurement.`,
      );
    }
    addFeature(trimmedName, value);
  });
};
