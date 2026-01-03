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
  width?: IMeasurement | IMeasurement[];
  minHeight?: IMeasurement | IMeasurement[];
  maxHeight?: IMeasurement | IMeasurement[];
  height?: IMeasurement | IMeasurement[];
  aspectRatio?: MediaQueryRatio | MediaQueryRatio[];
  minAspectRatio?: MediaQueryRatio | MediaQueryRatio[];
  maxAspectRatio?: MediaQueryRatio | MediaQueryRatio[];
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
  const allowQueryArrays = helpers.config.allowQueryArrays !== false;
  const assertNoArray = (value: unknown, label: string): void => {
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(`${label} does not allow arrays.`);
    }
  };
  const emitFeature = (name: string, value: IMeasurement | IMeasurement[] | MediaQueryRatio | MediaQueryRatio[]): void => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        (helpers.addFeatureUnsafe ?? helpers.addFeature)(name, entry);
      });
      return;
    }
    helpers.addFeature(name, value);
  };

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

  if (props.width !== undefined) {
    assertNoArray(props.width, 'width');
    emitFeature('width', props.width);
  }
  if (props.height !== undefined) {
    assertNoArray(props.height, 'height');
    emitFeature('height', props.height);
  }
  if (props.minHeight !== undefined) {
    assertNoArray(props.minHeight, 'minHeight');
    emitFeature('min-height', props.minHeight);
  }
  if (props.maxHeight !== undefined) {
    assertNoArray(props.maxHeight, 'maxHeight');
    emitFeature('max-height', props.maxHeight);
  }
  if (props.aspectRatio !== undefined) {
    assertNoArray(props.aspectRatio, 'aspectRatio');
    emitFeature('aspect-ratio', props.aspectRatio);
  }
  if (props.minAspectRatio !== undefined) {
    assertNoArray(props.minAspectRatio, 'minAspectRatio');
    emitFeature('min-aspect-ratio', props.minAspectRatio);
  }
  if (props.maxAspectRatio !== undefined) {
    assertNoArray(props.maxAspectRatio, 'maxAspectRatio');
    emitFeature('max-aspect-ratio', props.maxAspectRatio);
  }
  if (props.orientation) {
    helpers.addFeature('orientation', props.orientation);
  }
};

export const emitDimensionsFeatures = createEmitDimensionsFeatures(
  defaultMediaQueryValidation,
);
