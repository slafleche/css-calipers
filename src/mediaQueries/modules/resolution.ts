import type { IMeasurement } from '../../core';
import type {
  MediaQueryBuilderHelpers,
  MediaQueryValidator,
} from '../helpers';
import { applyMediaQueryValidation } from '../helpers';
import {
  defaultMediaQueryValidation,
  type MediaQueryValidation,
} from '../validation';
import { runMediaQueryLint } from '../linting';
import { lintResolutionRedundancy } from '../linting/resolution';

export interface IMediaQueryResolutionRange {
  minResolution?: IMeasurement | IMeasurement[];
  maxResolution?: IMeasurement | IMeasurement[];
  resolutionValue?: IMeasurement | IMeasurement[];
}

export type MediaQueryResolutionValidator =
  MediaQueryValidator<IMediaQueryResolutionRange>;

export const createEmitResolutionFeatures = (
  validation: MediaQueryValidation,
) => (
  props: IMediaQueryResolutionRange,
  helpers: MediaQueryBuilderHelpers,
  validate?: MediaQueryResolutionValidator,
): void => {
  const allowQueryArrays = helpers.config.allowQueryArrays !== false;
  const assertNoArray = (value: unknown, label: string): void => {
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(`${label} does not allow arrays.`);
    }
  };
  const emitFeature = (name: string, value: IMeasurement | IMeasurement[]): void => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        (helpers.addFeatureUnsafe ?? helpers.addFeature)(name, entry);
      });
      return;
    }
    helpers.addFeature(name, value);
  };

  const { runMediaQueryValidation, validateResolutionValues } =
    validation;

  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateResolutionValues,
      'resolution',
      'resolution values must be greater than 0',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryLint(
      props,
      helpers,
      lintResolutionRedundancy,
      'resolution should not be combined with minResolution or maxResolution',
    )
  ) {
    return;
  }
  if (!applyMediaQueryValidation(props, helpers, validate, 'resolution')) {
    return;
  }

  if (props.resolutionValue !== undefined) {
    assertNoArray(props.resolutionValue, 'resolutionValue');
    emitFeature('resolution', props.resolutionValue);
  }
  if (props.minResolution !== undefined) {
    assertNoArray(props.minResolution, 'minResolution');
    emitFeature('min-resolution', props.minResolution);
  }
  if (props.maxResolution !== undefined) {
    assertNoArray(props.maxResolution, 'maxResolution');
    emitFeature('max-resolution', props.maxResolution);
  }
};

export const emitResolutionFeatures = createEmitResolutionFeatures(
  defaultMediaQueryValidation,
);
