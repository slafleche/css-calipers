import type { ComplexStyleRule } from "../mediaQueries/types";

export const mediaQueryOutputVanillaExtract = (
  media: ComplexStyleRule
): Record<string, unknown> => ({
  "&": media,
});
