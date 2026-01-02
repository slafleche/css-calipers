import type { CSSComparison, CSSRange } from "../types";
import type { Comparison, IComparisonOperator } from "../../comparisons";
import type { IMeasurement } from "../../core";
import type { SizeComparisonValue } from "../containerQueries";
import type {
  ContainerQueryBuilderHelpers,
  ContainerQueryValidator,
} from "../helpers";
import {
  applyContainerQueryValidation,
  formatContainerQueryComparison,
  formatContainerQueryValue,
} from "../helpers";
import { defaultContainerQueryValidation } from "../validation";
import { runContainerQueryLint } from "../linting";
import {
  lintInlineRangeCollapse,
  lintInlineRedundancy,
} from "../linting/inline";
import { normalizeToArray } from "../../internal/normalizeToArray";

export interface IContainerQueryInline {
  inlineSize?: CSSComparison<IMeasurement> | CSSComparison<IMeasurement>[];
  inlineSizeRange?: CSSRange<IMeasurement> | CSSRange<IMeasurement>[];
}

export type ContainerQueryInlineValidator =
  ContainerQueryValidator<IContainerQueryInline>;

export type CSSContainerInlineSizeFeature = IContainerQueryInline;

export type InlineComparisonVariable = "inlineSize";

export type InlineComparison = Comparison<
  InlineComparisonVariable,
  SizeComparisonValue
>;

export type ComparisonInline<
  Variable = IContainerQueryInline[keyof IContainerQueryInline],
  Value = IMeasurement
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};

type InlineRange = CSSRange<IMeasurement>;
type InlineSizeComparison = CSSComparison<IMeasurement>;

const emitInlineComparison = (
  name: string,
  comparison: InlineSizeComparison,
  addCondition: (condition: string) => void,
): void => {
  addCondition(
    formatContainerQueryComparison(name, comparison.operator, comparison.value),
  );
};

const emitInlineRange = (
  name: string,
  range: InlineRange,
  addCondition: (condition: string) => void,
): void => {
  const min = formatContainerQueryValue(range.min);
  const max = formatContainerQueryValue(range.max);

  if ("minOperator" in range) {
    addCondition(`(${min} ${range.minOperator} ${name})`);
    addCondition(`(${name} <= ${max})`);
    return;
  }

  addCondition(`(${min} <= ${name})`);
  addCondition(`(${name} ${range.maxOperator} ${max})`);
};

export const emitInlineSizeFeatures = (
  props: IContainerQueryInline,
  helpers: ContainerQueryBuilderHelpers,
  validate?: ContainerQueryInlineValidator,
): void => {
  const allowQueryArrays = helpers.config.allowQueryArrays !== false;
  const assertNoArray = (value: unknown, label: string): void => {
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(`${label} does not allow arrays.`);
    }
  };

  const {
    runContainerQueryValidation,
    validateInlineSizeValues,
  } = defaultContainerQueryValidation;

  if (
    !runContainerQueryValidation(
      props,
      helpers,
      validateInlineSizeValues,
      "inline",
      "inline size values must be valid measurements greater than 0",
    )
  ) {
    return;
  }

  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintInlineRedundancy,
      "inlineSize should not be combined with inlineSizeRange",
    )
  ) {
    return;
  }
  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintInlineRangeCollapse,
      "inlineSizeRange min and max are equal; use inlineSize instead",
    )
  ) {
    return;
  }

  if (!applyContainerQueryValidation(props, helpers, validate, "inline")) {
    return;
  }

  const { addCondition } = helpers;

  assertNoArray(props.inlineSize, "inlineSize");
  normalizeToArray(props.inlineSize).forEach((value) => {
    emitInlineComparison("inline-size", value, addCondition);
  });
  assertNoArray(props.inlineSizeRange, "inlineSizeRange");
  normalizeToArray(props.inlineSizeRange).forEach((value) => {
    emitInlineRange("inline-size", value, addCondition);
  });
};
