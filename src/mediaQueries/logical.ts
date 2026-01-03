import type {
  MediaQueryBuilderConfig,
  MediaQueryBuilderHelpers,
  MediaQueryExtensionHandler,
} from "./helpers";
import {
  buildMediaQueryStringFromParts,
  createMediaQueryFeatureEmitter,
  createMediaQueryFeatureEmitterWithTracking,
} from "./helpers";

type LogicalOperatorKey = "and" | "or" | "not";

export type MediaQueryLogicalAnd<TProps> = {
  and?: MediaQueryLogicalTarget<TProps>;
};

export type MediaQueryLogicalOr<TProps> = {
  or?: MediaQueryLogicalTarget<TProps>;
};

export type MediaQueryLogicalNot<TProps> = {
  not?: MediaQueryLogicalTarget<TProps>;
};

export type MediaQueryLogicalOperator<TProps> = MediaQueryLogicalAnd<TProps> &
  MediaQueryLogicalOr<TProps> &
  MediaQueryLogicalNot<TProps>;

export type MediaQueryLogicalNode<TProps> = TProps &
  MediaQueryLogicalOperator<TProps>;

export type MediaQueryLogicalRoot<TProps> =
  | TProps
  | (TProps & MediaQueryLogicalNot<TProps>)
  | MediaQueryLogicalNot<TProps>;

export type MediaQueryLogicalTarget<TProps> =
  | MediaQueryLogicalNode<TProps>
  | MediaQueryLogicalNode<TProps>[]
  | Record<string, MediaQueryLogicalNode<TProps>>;

type ConditionResult = {
  condition: string;
  grouped: boolean;
};

type BuildLogicalOptions<TProps> = {
  buildBaseCondition: (props: TProps) => string;
  resolveType?: (props: TProps) => "all" | "print" | "screen" | undefined;
  featureKeys?: ReadonlySet<string>;
};

export const createMediaQueryConditionBuilder = <TProps>(options: {
  emitBase: MediaQueryExtensionHandler<TProps>;
  config?: MediaQueryBuilderConfig;
}): ((props: TProps) => string) => {
  return (props: TProps): string => {
    const parts: string[] = [];
    const emittedFeatures = new Set<string>();
    const helpers: MediaQueryBuilderHelpers = {
      addFeature: createMediaQueryFeatureEmitterWithTracking(parts, {
        emitted: emittedFeatures,
        lintingMode: options.config?.errorHandling?.lintingMode ?? "throw",
      }),
      addFeatureUnsafe: createMediaQueryFeatureEmitter(parts),
      config: options.config ?? {},
    };

    options.emitBase(props, helpers);
    return parts.join(" and ");
  };
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const LOGICAL_KEYS = new Set<LogicalOperatorKey>(["and", "or", "not"]);

const isLogicalInput = <TProps>(
  value: unknown,
  featureKeys?: ReadonlySet<string>,
): value is MediaQueryLogicalNode<TProps> => {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.some(
    (key) => LOGICAL_KEYS.has(key as LogicalOperatorKey) || featureKeys?.has(key),
  );
};

const isCompoundCondition = (condition: string): boolean =>
  condition.includes(" and ") || condition.includes(" or ");

const formatOperand = (result: ConditionResult): string => {
  if (!result.condition) return "";
  if (result.grouped) return result.condition;
  if (isCompoundCondition(result.condition)) {
    return `(${result.condition})`;
  }
  return result.condition;
};

const normalizeTarget = <TProps>(
  target: MediaQueryLogicalTarget<TProps>,
  featureKeys?: ReadonlySet<string>,
): MediaQueryLogicalNode<TProps>[] => {
  if (Array.isArray(target)) return target;
  if (isLogicalInput<TProps>(target, featureKeys)) return [target];
  if (isPlainObject(target)) {
    return Object.values(
      target as Record<string, MediaQueryLogicalNode<TProps>>,
    );
  }
  return [];
};

const hasLogicalKeys = (value: unknown): boolean =>
  isPlainObject(value) &&
  Object.keys(value).some((key) => LOGICAL_KEYS.has(key as LogicalOperatorKey));

const splitBaseProps = <TProps>(
  input: MediaQueryLogicalNode<TProps>,
): MediaQueryLogicalNode<TProps>[] => {
  const entries = Object.entries(input as Record<string, unknown>).filter(
    ([key, value]) =>
      !LOGICAL_KEYS.has(key as LogicalOperatorKey) &&
      key !== "type" &&
      value !== undefined,
  );

  if (entries.length <= 1) return [input];

  return entries.map(([key, value]) => ({
    [key]: value,
  } as MediaQueryLogicalNode<TProps>));
};

const buildOperatorGroup = <TProps>(
  operator: "and" | "or",
  target: MediaQueryLogicalTarget<TProps>,
  options: BuildLogicalOptions<TProps>,
): ConditionResult => {
  if (Array.isArray(target)) {
    return buildTargetCondition(target, options);
  }

  if (
    isLogicalInput<TProps>(target, options.featureKeys) &&
    !hasLogicalKeys(target)
  ) {
    const operands = splitBaseProps(target);
    if (operands.length === 1) {
      return buildLogicalCondition(operands[0], options);
    }
    const condition = operands
      .map((entry) => formatOperand(buildLogicalCondition(entry, options)))
      .filter(Boolean)
      .join(` ${operator} `);
    return { condition, grouped: false };
  }

  return buildTargetCondition(target, options);
};

const buildTargetCondition = <TProps>(
  target: MediaQueryLogicalTarget<TProps>,
  options: BuildLogicalOptions<TProps>,
): ConditionResult => {
  const entries = normalizeTarget(target, options.featureKeys).filter(Boolean);
  if (entries.length === 0) return { condition: "", grouped: false };
  if (entries.length === 1) {
    return buildLogicalCondition(entries[0], options);
  }

  const operands = entries
    .map((entry) => formatOperand(buildLogicalCondition(entry, options)))
    .filter(Boolean);
  const condition = operands.join(" and ");
  return { condition, grouped: false };
};

const applyBinaryOperator = <TProps>(
  operator: "and" | "or",
  left: ConditionResult,
  target: MediaQueryLogicalTarget<TProps>,
  options: BuildLogicalOptions<TProps>,
): ConditionResult => {
  if (!left.condition) {
    return buildOperatorGroup(operator, target, options);
  }

  const rightResult = buildTargetCondition(target, options);
  if (!rightResult.condition) return left;

  const leftOperand = formatOperand(left);
  const rightOperand = formatOperand(rightResult);
  return {
    condition: `${leftOperand} ${operator} ${rightOperand}`,
    grouped: false,
  };
};

const applyNotOperator = <TProps>(
  left: ConditionResult,
  target: MediaQueryLogicalTarget<TProps>,
  options: BuildLogicalOptions<TProps>,
): ConditionResult => {
  if (isPlainObject(target) && ("and" in target || "or" in target)) {
    throw new Error("not cannot have a direct and/or child");
  }
  const rightResult = buildTargetCondition(target, options);
  if (!rightResult.condition) return left;
  const rightOperand = formatOperand(rightResult);
  const notCondition = `not ${rightOperand}`;
  if (!left.condition) {
    return { condition: notCondition, grouped: false };
  }
  const leftOperand = formatOperand(left);
  return {
    condition: `${leftOperand} and (${notCondition})`,
    grouped: false,
  };
};

const buildLogicalCondition = <TProps>(
  input: MediaQueryLogicalNode<TProps>,
  options: BuildLogicalOptions<TProps>,
): ConditionResult => {
  const { and, or, not, ...baseProps } = input as MediaQueryLogicalInput<TProps> &
    Record<string, unknown>;
  const baseCondition = options.buildBaseCondition(baseProps as TProps);
  const hasLogical = Boolean(and || or || not);

  if (!hasLogical) {
    return { condition: baseCondition, grouped: false };
  }

  let result: ConditionResult = { condition: baseCondition, grouped: false };
  if (and) {
    result = applyBinaryOperator("and", result, and, options);
  }
  if (or) {
    result = applyBinaryOperator("or", result, or, options);
  }
  if (not) {
    result = applyNotOperator(result, not, options);
  }

  return { condition: `(${result.condition})`, grouped: true };
};

export const buildMediaQueryLogicalString = <TProps>(
  input: MediaQueryLogicalRoot<TProps>,
  options: BuildLogicalOptions<TProps>,
): { condition: string; mediaType: "all" | "print" | "screen" } => {
  if (isPlainObject(input) && ("and" in input || "or" in input)) {
    throw new Error("root logical operators are limited to not");
  }
  const condition = buildLogicalCondition(
    input as MediaQueryLogicalNode<TProps>,
    options,
  ).condition;
  const mediaType = options.resolveType?.(input as TProps) ?? "screen";
  return { condition, mediaType };
};

export const buildMediaQueryStringFromLogical = <TProps>(
  input: MediaQueryLogicalRoot<TProps>,
  options: BuildLogicalOptions<TProps>,
): string => {
  const { condition, mediaType } = buildMediaQueryLogicalString(input, options);
  return buildMediaQueryStringFromParts(
    mediaType,
    condition ? [condition] : [],
  );
};
