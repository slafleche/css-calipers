import { describe, expect, it } from "vitest";
import { compare } from "../../../src/comparisons";
import { m } from "../../../src";
import {
  buildContainerQueryString,
  makeContainerQueryStyle,
} from "../../../src/containerQueries";
import { makeMediaQueryStyle } from "../../../src/mediaQueries";
import type {
  ComplexStyleRule,
  StyleRule,
} from "../../../src/mediaQueries/types";
import {
  containerQueryOutputVanillaExtract,
  mediaQueryOutputVanillaExtract,
} from "../../../src/libraryHelpers/vanilla-extract";

describe("containerQueries (src)", () => {
  it("builds core min/max width queries", () => {
    const result = buildContainerQueryString({
      minWidth: m(480),
      maxWidth: m(1024),
    });

    expect(result).toBe(
      "(min-width: 480px) and (max-width: 1024px)",
    );
  });

  it("builds inline and block comparison conditions", () => {
    const result = buildContainerQueryString({
      inlineSize: compare.gte(m(28, "rem")),
      blockSize: compare.lt(m(40, "rem")),
    });

    expect(result).toBe(
      "(inline-size >= 28rem) and (block-size < 40rem)",
    );
  });

  it("builds block ranges with min and max operators", () => {
    const result = buildContainerQueryString({
      blockSizeRange: {
        min: m(10),
        max: m(20),
        minOperator: "<=",
      },
    });

    expect(result).toBe(
      "(10px <= block-size) and (block-size <= 20px)",
    );
  });

  it("builds style conditions", () => {
    const result = buildContainerQueryString({
      style: { display: "grid" },
    });

    expect(result).toBe("(style(display: grid))");
  });

  it("builds custom feature conditions", () => {
    const result = buildContainerQueryString({
      customFeatures: { "custom-flag": "enabled" },
    });

    expect(result).toBe("(custom-flag: enabled)");
  });

  it("maps query styles to @container rules", () => {
    const queryStyles = makeContainerQueryStyle({
      wide: {
        inlineSize: compare.gte(m(28, "rem")),
      },
    })({
      wide: { color: "red" },
    });

    expect(queryStyles).toEqual({
      "@container": {
        "(inline-size >= 28rem)": { color: "red" },
      },
    });
  });

  it("supports container queries nested inside media queries", () => {
    const containerStyles = makeContainerQueryStyle({
      wide: { inlineSize: compare.gte(m(30)) },
    })({
      wide: { color: "red" },
    });

    const mediaStyles = makeMediaQueryStyle({
      desktop: { minWidth: m(640) },
    })({
      desktop: containerStyles,
    });

    expect(mediaStyles).toEqual({
      "@media": {
        "screen and (min-width: 640px)": {
          "@container": {
            "(inline-size >= 30px)": { color: "red" },
          },
        },
      },
    });
  });

  it("supports media queries nested inside container queries", () => {
    const mediaStyles = makeMediaQueryStyle({
      desktop: { minWidth: m(640) },
    })({
      desktop: { color: "red" },
    });

    const containerStyles = makeContainerQueryStyle({
      wide: { inlineSize: compare.gte(m(30)) },
    })({
      wide: mediaStyles,
    });

    expect(containerStyles).toEqual({
      "@container": {
        "(inline-size >= 30px)": {
          "@media": {
            "screen and (min-width: 640px)": { color: "red" },
          },
        },
      },
    });
  });

  it("supports deep nesting between container and media queries", () => {
    const mediaQuery = "screen and (min-width: 640px)";
    const containerQuery = "(inline-size >= 30px)";
    let current: ComplexStyleRule = { color: "red" };

    for (let level = 9; level >= 0; level -= 1) {
      if (level % 2 === 0) {
        current = makeMediaQueryStyle({
          [`mq${level}`]: { minWidth: m(640) },
        })({
          [`mq${level}`]: current,
        });
      } else {
        current = makeContainerQueryStyle({
          [`cq${level}`]: { inlineSize: compare.gte(m(30)) },
        })({
          [`cq${level}`]: current,
        });
      }
    }

    let cursor = current as Record<string, unknown>;
    for (let level = 0; level < 10; level += 1) {
      if (level % 2 === 0) {
        const media = cursor["@media"] as Record<string, unknown> | undefined;
        expect(media).toBeTruthy();
        cursor = media?.[mediaQuery] as Record<string, unknown>;
      } else {
        const container = cursor["@container"] as
          | Record<string, unknown>
          | undefined;
        expect(container).toBeTruthy();
        cursor = container?.[containerQuery] as Record<string, unknown>;
      }
    }

    expect(cursor).toEqual({ color: "red" });
  });

  it("supports nested queries when using vanilla-extract output helpers", () => {
    const containerStyles = makeContainerQueryStyle({
      wide: { inlineSize: compare.gte(m(30)) },
    })({
      wide: { color: "red" },
    });

    const mediaStyles = makeMediaQueryStyle({
      desktop: { minWidth: m(640) },
    })({
      desktop:
        containerQueryOutputVanillaExtract(
          containerStyles,
        ) as unknown as StyleRule,
    });

    const wrapped = mediaQueryOutputVanillaExtract(mediaStyles);

    expect(wrapped).toEqual({
      "&": {
        "@media": {
          "screen and (min-width: 640px)": {
            "&": {
              "@container": {
                "(inline-size >= 30px)": { color: "red" },
              },
            },
          },
        },
      },
    });
  });
});
