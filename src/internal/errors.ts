import type { IMeasurement } from '../core';

export type ErrorCode =
  | 'CALIPERS_E_NONFINITE'
  | 'CALIPERS_E_UNIT_MISMATCH'
  | 'CALIPERS_E_ASSERT_UNIT'
  | 'CALIPERS_E_ASSERT_CONDITION'
  | 'CALIPERS_E_ASSERT_PREDICATE'
  | 'CALIPERS_E_DIVIDE_BY_ZERO'
  | 'CALIPERS_E_NONFINITE_RESULT'
  | 'CALIPERS_E_CLAMP_NONFINITE_BOUNDS'
  | 'CALIPERS_E_CLAMP_INVALID_RANGE';

export interface ErrorDetails {
  code?: ErrorCode;
  helper?: string;
  inputSummary?: string;
  stackHint?: string;
}

export type StackHintMode = 'auto' | 'on' | 'off';

export interface ErrorConfig {
  stackHints?: StackHintMode;
}

export type ErrorConfigStore = {
  getErrorConfig: () => Required<ErrorConfig>;
  setErrorConfig: (next: ErrorConfig) => void;
};

export interface MeasurementMethodErrorContext {
  /** Operation name (for example, "add", "divide", "clamp"). */
  operation: string;
  /** Receiver of the method call. */
  caller: IMeasurement<string>;
  /** Other measurements involved (for example, delta, min, max). */
  params: IMeasurement<string>[];
  /** Core human-readable description of what went wrong. */
  message: string;
  /** Optional caller-supplied context prefix. */
  context?: string;
  /** Optional extra details for error formatting. */
  details?: ErrorDetails;
  /** Override the stack hint config for this error. */
  includeStackHint?: boolean;
}

export interface HelperErrorContext {
  /** Operation name (for example, "assertMatchingUnits"). */
  operation: string;
  /** Measurements involved in the helper call (for example, left/right, min/max). */
  params: IMeasurement<string>[];
  /** Core human-readable description of what went wrong. */
  message: string;
  /** Optional caller-supplied context prefix. */
  context?: string;
  /** Optional extra details for error formatting. */
  details?: ErrorDetails;
  /** Override the stack hint config for this error. */
  includeStackHint?: boolean;
}

const DEFAULT_ERROR_CONFIG: Required<ErrorConfig> = {
  stackHints: 'auto',
};

let errorConfig: Required<ErrorConfig> = { ...DEFAULT_ERROR_CONFIG };

export const createErrorConfigStore = (
  initial: ErrorConfig = {},
): ErrorConfigStore => {
  let config: Required<ErrorConfig> = {
    ...DEFAULT_ERROR_CONFIG,
    ...initial,
  };
  return {
    getErrorConfig: () => config,
    setErrorConfig: (next: ErrorConfig) => {
      config = { ...config, ...next };
    },
  };
};

export const setErrorConfig = (next: ErrorConfig): void => {
  errorConfig = { ...errorConfig, ...next };
};

export const getErrorConfig = (): Required<ErrorConfig> =>
  errorConfig;

export const createErrorHelpers = (store: ErrorConfigStore) => {
  const getConfig = (): Required<ErrorConfig> =>
    store.getErrorConfig();
  const throwMeasurementMethodError = (
    ctx: MeasurementMethodErrorContext,
  ): never => {
    const includeStack = shouldIncludeStackHint(
      ctx.includeStackHint,
      getConfig(),
    );
    const stackHint = includeStack
      ? extractStackHint(new Error().stack)
      : undefined;
    throw new Error(
      formatErrorMessage(ctx.operation, ctx.message, ctx.context, {
        ...ctx.details,
        stackHint,
      }),
    );
  };
  const throwHelperError = (ctx: HelperErrorContext): never => {
    const includeStack = shouldIncludeStackHint(
      ctx.includeStackHint,
      getConfig(),
    );
    const stackHint = includeStack
      ? extractStackHint(new Error().stack)
      : undefined;
    throw new Error(
      formatErrorMessage(ctx.operation, ctx.message, ctx.context, {
        ...ctx.details,
        stackHint,
      }),
    );
  };
  return { throwMeasurementMethodError, throwHelperError };
};

const isProductionEnv = (): boolean => {
  if (typeof globalThis === 'undefined') return false;
  const maybeProcess = (
    globalThis as { process?: { env?: { NODE_ENV?: string } } }
  ).process;
  return maybeProcess?.env?.NODE_ENV === 'production';
};

const shouldIncludeStackHint = (
  override?: boolean,
  config: Required<ErrorConfig> = errorConfig,
): boolean => {
  if (override === false) return false;
  if (config.stackHints === 'off') return false;
  if (config.stackHints === 'on') return true;
  if (override === true) return !isProductionEnv();
  return false;
};

const formatDetailBlock = (details?: ErrorDetails): string => {
  if (!details) return '';
  const parts: string[] = [];
  if (details.code) parts.push(`code=${details.code}`);
  if (details.helper) parts.push(`helper=${details.helper}`);
  if (details.inputSummary)
    parts.push(`inputs=${details.inputSummary}`);
  if (details.stackHint) parts.push(`stack=${details.stackHint}`);
  return parts.length > 0 ? ` [${parts.join(' | ')}]` : '';
};

const formatErrorMessage = (
  operation: string,
  message: string,
  context?: string,
  details?: ErrorDetails,
): string => {
  const core = `${operation}: ${message}`;
  const base = context ? `${context}: ${core}` : core;
  return `${base}${formatDetailBlock(details)}`;
};

const extractStackHint = (stack?: string): string | undefined => {
  if (!stack) return undefined;
  const lines = stack
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1);
  if (lines.length === 0) return undefined;
  const filtered = lines.filter(
    (line) =>
      !line.includes('/src/internal/errors') &&
      !line.includes('throwHelperError') &&
      !line.includes('throwMeasurementMethodError'),
  );
  const hint = filtered[0] ?? lines[0];
  return hint.replace(/^at\s+/, '');
};

/** Throw an Error for a Measurement instance method using a structured context. */
export const throwMeasurementMethodError = (
  ctx: MeasurementMethodErrorContext,
): never => {
  const includeStack = shouldIncludeStackHint(ctx.includeStackHint);
  const stackHint = includeStack
    ? extractStackHint(new Error().stack)
    : undefined;
  throw new Error(
    formatErrorMessage(ctx.operation, ctx.message, ctx.context, {
      ...ctx.details,
      stackHint,
    }),
  );
};

/** Throw an Error for a helper/free function using a structured context. */
export const throwHelperError = (ctx: HelperErrorContext): never => {
  const includeStack = shouldIncludeStackHint(ctx.includeStackHint);
  const stackHint = includeStack
    ? extractStackHint(new Error().stack)
    : undefined;
  throw new Error(
    formatErrorMessage(ctx.operation, ctx.message, ctx.context, {
      ...ctx.details,
      stackHint,
    }),
  );
};
