import type { IMeasurement } from "../core";

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
}

const formatErrorMessage = (
  operation: string,
  message: string,
  context?: string,
): string => {
  const core = `${operation}: ${message}`;
  return context ? `${context}: ${core}` : core;
};

/** Throw an Error for a Measurement instance method using a structured context. */
export const throwMeasurementMethodError = (
  ctx: MeasurementMethodErrorContext,
): never => {
  throw new Error(
    formatErrorMessage(ctx.operation, ctx.message, ctx.context),
  );
};

/** Throw an Error for a helper/free function using a structured context. */
export const throwHelperError = (ctx: HelperErrorContext): never => {
  throw new Error(
    formatErrorMessage(ctx.operation, ctx.message, ctx.context),
  );
};
