import type { IRatio, IMeasurement } from '../../core';
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
import {
  lintHeightRedundancy,
  lintWidthRedundancy,
} from '../linting/core';

type MediaQueryRatio = IRatio;

export interface IMediaQueryDimensions {
  width?: IMeasurement;
  minHeight?: IMeasurement;
  maxHeight?: IMeasurement;
  height?: IMeasurement;
  aspectRatio?: MediaQueryRatio;
  minAspectRatio?: MediaQueryRatio;
  maxAspectRatio?: MediaQueryRatio;
  orientation?: 'landscape' | 'portrait';
}

export type MediaQueryDimensionsValidator =
  MediaQueryValidator<IMediaQueryDimensions>;

export const createEmitDimensionsFeatures = (
  validation: MediaQueryValidation,
) => (
  props: IMediaQueryDimensions,
  helpers: MediaQueryBuilderHelpers,
  validate?: MediaQueryDimensionsValidator,
): void => {
  const {
    runMediaQueryValidation,
    validateMinMaxHeight,
    validateHeightValuesPositive,
    validateMinMaxAspectRatio,
    validateAspectRatioValuesPositive,
    validateWidthValuesPositive,
  } = validation;

  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateMinMaxHeight,
      'dimensions',
      'minHeight must be less than or equal to maxHeight',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateHeightValuesPositive,
      'dimensions',
      'height values must be greater than 0',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryLint(
      props,
      helpers,
      lintWidthRedundancy,
      'width should not be combined with minWidth or maxWidth',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryLint(
      props,
      helpers,
      lintHeightRedundancy,
      'height should not be combined with minHeight or maxHeight',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateWidthValuesPositive,
      'dimensions',
      'width values must be greater than 0',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateMinMaxAspectRatio,
      'dimensions',
      'minAspectRatio must be less than or equal to maxAspectRatio',
    )
  ) {
    return;
  }
  if (
    !runMediaQueryValidation(
      props,
      helpers,
      validateAspectRatioValuesPositive,
      'dimensions',
      'aspect ratio values must be greater than 0',
    )
  ) {
    return;
  }
  if (!applyMediaQueryValidation(props, helpers, validate, 'dimensions')) {
    return;
  }

  const { addFeature } = helpers;

  if (props.width) {
    addFeature('width', props.width);
  }
  if (props.height) {
    addFeature('height', props.height);
  }
  if (props.minHeight) {
    addFeature('min-height', props.minHeight);
  }
  if (props.maxHeight) {
    addFeature('max-height', props.maxHeight);
  }
  if (props.aspectRatio) {
    addFeature('aspect-ratio', props.aspectRatio);
  }
  if (props.minAspectRatio) {
    addFeature('min-aspect-ratio', props.minAspectRatio);
  }
  if (props.maxAspectRatio) {
    addFeature('max-aspect-ratio', props.maxAspectRatio);
  }
  if (props.orientation) {
    addFeature('orientation', props.orientation);
  }
};

export const emitDimensionsFeatures = createEmitDimensionsFeatures(
  defaultMediaQueryValidation,
);
