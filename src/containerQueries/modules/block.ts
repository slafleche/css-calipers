import type { Comparison, IComparisonOperator } from "../../comparisons";
import type { IMeasurement } from "../../core";
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
  lintBlockRangeCollapse,
  lintBlockRedundancy,
} from "../linting/block";
import type { CSSComparison, CSSRange } from "../types";
import { SizeComparisonValue } from "../containerQueries";
import { normalizeToArray } from "../../internal/normalizeToArray";

export interface IContainerQueryBlock {
  blockSize?: CSSComparison<IMeasurement> | CSSComparison<IMeasurement>[];
  blockSizeRange?: CSSRange<IMeasurement> | CSSRange<IMeasurement>[];
}

export type ContainerQueryBlockValidator =
  ContainerQueryValidator<IContainerQueryBlock>;

export type CSSContainerBlockSizeFeature = IContainerQueryBlock;

export type BlockComparisonVariable = "blockSize";

export type BlockComparison = Comparison<
  BlockComparisonVariable,
  SizeComparisonValue
>;

export type ComparisonBlock<
  Variable = IContainerQueryBlock[keyof IContainerQueryBlock],
  Value = IMeasurement
> = {
  variable: Variable;
  operator: IComparisonOperator;
  value: Value;
};

type BlockRange = CSSRange<IMeasurement>;
type BlockSizeComparison = CSSComparison<IMeasurement>;

const emitBlockComparison = (
  name: string,
  comparison: BlockSizeComparison,
  addCondition: (condition: string) => void,
): void => {
  addCondition(
    formatContainerQueryComparison(name, comparison.operator, comparison.value),
  );
};

const emitBlockRange = (
  name: string,
  range: BlockRange,
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

export const emitBlockSizeFeatures = (
  props: IContainerQueryBlock,
  helpers: ContainerQueryBuilderHelpers,
  validate?: ContainerQueryBlockValidator,
): void => {
  const allowQueryArrays = helpers.config.allowQueryArrays !== false;
  const assertNoArray = (value: unknown, label: string): void => {
    if (Array.isArray(value) && !allowQueryArrays) {
      throw new Error(`${label} does not allow arrays.`);
    }
  };

  const {
    runContainerQueryValidation,
    validateBlockSizeValues,
  } = defaultContainerQueryValidation;

  if (
    !runContainerQueryValidation(
      props,
      helpers,
      validateBlockSizeValues,
      "block",
      "block size values must be valid measurements greater than 0",
    )
  ) {
    return;
  }

  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintBlockRedundancy,
      "blockSize should not be combined with blockSizeRange",
    )
  ) {
    return;
  }
  if (
    !runContainerQueryLint(
      props,
      helpers,
      lintBlockRangeCollapse,
      "blockSizeRange min and max are equal; use blockSize instead",
    )
  ) {
    return;
  }

  if (!applyContainerQueryValidation(props, helpers, validate, "block")) {
    return;
  }

  const { addCondition } = helpers;

  assertNoArray(props.blockSize, "blockSize");
  normalizeToArray(props.blockSize).forEach((value) => {
    emitBlockComparison("block-size", value, addCondition);
  });
  assertNoArray(props.blockSizeRange, "blockSizeRange");
  normalizeToArray(props.blockSizeRange).forEach((value) => {
    emitBlockRange("block-size", value, addCondition);
  });
};
