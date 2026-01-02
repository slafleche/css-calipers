export type ContainerQueryValidationResult =
  | boolean
  | string
  | null
  | undefined
  | {
      valid: boolean;
      message?: string;
    };

export type ContainerQueryValidator<TConfig> = (
  config: TConfig,
) => ContainerQueryValidationResult;
