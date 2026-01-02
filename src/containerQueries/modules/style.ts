import type {
  CSSContainerProperties,
  CSSContainerStyleCondition,
} from "../types";
import type {
  ContainerQueryBuilderHelpers,
  ContainerQueryValidator,
} from "../helpers";
import {
  applyContainerQueryValidation,
  formatContainerQueryValue,
} from "../helpers";
import { defaultContainerQueryValidation } from "../validation";
import { runContainerQueryLint } from "../linting";
import { lintStyleCondition } from "../linting/style";

export interface IContainerQueryStyle {
  style?: CSSContainerStyleCondition;
}

export type IContainerQueryStyleVariables = IContainerQueryStyle["style"];

export type ContainerQueryStyleValidator =
  ContainerQueryValidator<IContainerQueryStyle>;

export type CSSContainerStyleFeature = IContainerQueryStyle;

export type ComparisonStyle = false;

export const emitStyleFeatures = (
  props: IContainerQueryStyle,
  helpers: ContainerQueryBuilderHelpers,
  validate?: ContainerQueryStyleValidator,
): void => {
  const {
    runContainerQueryValidation,
    validateStyleValues,
  } = defaultContainerQueryValidation;

  if (
    !runContainerQueryValidation(
      props,
      helpers,
      validateStyleValues,
      "style",
      "style conditions must be valid and non-empty",
    )
  ) {
    return;
  }

  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintStyleCondition,
      "style conditions must be valid and non-empty",
    )
  ) {
    return;
  }

  if (!applyContainerQueryValidation(props, helpers, validate, "style")) {
    return;
  }

  if (!props.style) return;
  const { addCondition } = helpers;

  Object.entries(props.style as CSSContainerProperties).forEach(
    ([name, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry === undefined || entry === null) return;
          addCondition(
            `(style(${name}: ${formatContainerQueryValue(entry)}))`,
          );
        });
        return;
      }
      addCondition(
        `(style(${name}: ${formatContainerQueryValue(value)}))`,
      );
    },
  );
};
