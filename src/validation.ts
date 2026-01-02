export type ValidationResult =
  | boolean
  | string
  | null
  | undefined
  | {
      valid: boolean;
      message?: string;
    };

export const normalizeValidationResult = (
  result: ValidationResult,
): { valid: boolean; message?: string } => {
  if (result === undefined || result === null) return { valid: true };
  if (typeof result === "boolean") return { valid: result };
  if (typeof result === "string") {
    return result ? { valid: false, message: result } : { valid: true };
  }
  return result;
};

export const toValidationResult = (
  error: unknown,
  fallback: string,
): ValidationResult => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
