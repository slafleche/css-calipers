import { describe, expect, it } from "vitest";
import { runMediaQueryTests } from "./mediaQueries.shared";

import { mDpi, mPx } from "../../../src";
import {
  buildMediaQueryFromFeatures,
  buildMediaQueryString,
  createMediaQueryBuilder,
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitResolutionFeatures,
  mediaQueryFactory,
} from "../../../src/mediaQueries";
import { mediaQueryOutputVanillaExtract } from "../../../src/libraryHelpers/vanilla-extract";

runMediaQueryTests("src", {
  buildMediaQueryFromFeatures,
  buildMediaQueryString,
  createMediaQueryBuilder,
  emitCustomFeatures,
  emitDimensionsFeatures,
  emitResolutionFeatures,
  mediaQueryFactory,
  mDpi,
  mPx,
});

describe("mediaQueries (src) factory output mappers", () => {
  it("wraps output for vanilla-extract", () => {
    const factory = mediaQueryFactory({
      queries: {
        desktop: { minWidth: mPx(640) },
      },
      config: {
        label: "vanilla-extract",
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
        output: mediaQueryOutputVanillaExtract,
      },
    });

    const result = factory({
      desktop: { color: "red" },
    });

    expect(result).toEqual({
      "&": {
        "@media": {
          "screen and (min-width: 640px)": { color: "red" },
        },
      },
    });
  });

  it("supports a custom output mapper", () => {
    const factory = mediaQueryFactory({
      queries: {
        desktop: { minWidth: mPx(640) },
      },
      config: {
        label: "custom-output",
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
        output: (media) => ({
          level1: {
            level2: media,
            extraCss: "someValue",
          },
        }),
      },
    });

    const result = factory({
      desktop: { color: "red" },
    });

    expect(result).toEqual({
      level1: {
        level2: {
          "@media": {
            "screen and (min-width: 640px)": { color: "red" },
          },
        },
        extraCss: "someValue",
      },
    });
  });
});
