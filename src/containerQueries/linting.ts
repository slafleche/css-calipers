import type {} from "./helpers";

export type ContainerQueryLintCheck<TConfig> = (config: TConfig) => void;

export const runContainerQueryLint = <TConfig>(
  config: TConfig,
  helpers: ContainerQueryBuilderHelpers,
  check?: ContainerQueryLintCheck<TConfig>,
  message = "Container query lint failed"
): boolean => {
  if (!check) return true;
  const mode: ContainerQueryLintingMode =
    helpers.config.errorHandling?.lintingMode ?? "throw";
  if (mode === "allow") return true;
  if (mode === "log") {
    try {
      check(config);
      return true;
    } catch {
      console.warn(message);
      return true;
    }
  }

  check(config);
  return true;
};
