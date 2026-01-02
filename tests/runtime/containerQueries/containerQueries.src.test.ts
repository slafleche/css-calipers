import { describe, expect, it } from "vitest";
import { compare } from "../../../src/comparisons";
import { m, r } from "../../../src";
import {
  buildContainerQueryString,
  buildContainerRange,
  makeContainerQueryStyle,
} from "../../../src/containerQueries";
import { createContainerQueryBuilder } from "../../../src/containerQueries/helpers";
import { emitCustomFeatures } from "../../../src/containerQueries/modules/custom";
import type { IContainerQueryProps } from "../../../src/containerQueries/containerQueries";
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
      blockSizeRange: buildContainerRange(m(10), m(20)),
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

  it("builds core min/max width array conditions", () => {
    const result = buildContainerQueryString({
      minWidth: [m(10), m(20)] as unknown as IContainerQueryProps["minWidth"],
      maxWidth: [m(30), m(40)] as unknown as IContainerQueryProps["maxWidth"],
    });

    expect(result).toBe(
      "(min-width: 10px) and (min-width: 20px) and (max-width: 30px) and (max-width: 40px)",
    );
  });

  it("builds core min/max height array conditions", () => {
    const result = buildContainerQueryString({
      minHeight: [m(50), m(60)] as unknown as IContainerQueryProps["minHeight"],
      maxHeight: [m(70), m(80)] as unknown as IContainerQueryProps["maxHeight"],
    });

    expect(result).toBe(
      "(min-height: 50px) and (min-height: 60px) and (max-height: 70px) and (max-height: 80px)",
    );
  });

  it("builds inline size array conditions", () => {
    const result = buildContainerQueryString({
      inlineSize: [
        compare.gte(m(10)),
        compare.lt(m(20)),
      ] as unknown as IContainerQueryProps["inlineSize"],
    });

    expect(result).toBe(
      "(inline-size >= 10px) and (inline-size < 20px)",
    );
  });

  it("builds inline size range array conditions", () => {
    const result = buildContainerQueryString({
      inlineSizeRange: [
        buildContainerRange(m(10), m(20)),
        buildContainerRange(m(24), m(30)),
      ] as unknown as IContainerQueryProps["inlineSizeRange"],
    });

    expect(result).toBe(
      "(10px <= inline-size) and (inline-size <= 20px) and (24px <= inline-size) and (inline-size <= 30px)",
    );
  });

  it("builds block size array conditions", () => {
    const result = buildContainerQueryString({
      blockSize: [
        compare.lt(m(24)),
        compare.gte(m(48)),
      ] as unknown as IContainerQueryProps["blockSize"],
    });

    expect(result).toBe(
      "(block-size < 24px) and (block-size >= 48px)",
    );
  });

  it("builds block size range array conditions", () => {
    const result = buildContainerQueryString({
      blockSizeRange: [
        buildContainerRange(m(24), m(48)),
        buildContainerRange(m(50), m(80)),
      ] as unknown as IContainerQueryProps["blockSizeRange"],
    });

    expect(result).toBe(
      "(24px <= block-size) and (block-size <= 48px) and (50px <= block-size) and (block-size <= 80px)",
    );
  });

  it("builds aspect ratio array conditions", () => {
    const result = buildContainerQueryString({
      aspectRatio: [r(16, 9), r(4, 3)] as unknown as IContainerQueryProps["aspectRatio"],
    });

    expect(result).toBe(
      "(aspect-ratio: 16/9) and (aspect-ratio: 4/3)",
    );
  });

  it("builds min-aspect-ratio array conditions", () => {
    const result = buildContainerQueryString({
      minAspectRatio: [r(4, 3), r(3, 2)] as unknown as IContainerQueryProps["minAspectRatio"],
    });

    expect(result).toBe(
      "(min-aspect-ratio: 4/3) and (min-aspect-ratio: 3/2)",
    );
  });

  it("builds max-aspect-ratio array conditions", () => {
    const result = buildContainerQueryString({
      maxAspectRatio: [r(21, 9), r(16, 9)] as unknown as IContainerQueryProps["maxAspectRatio"],
    });

    expect(result).toBe(
      "(max-aspect-ratio: 21/9) and (max-aspect-ratio: 16/9)",
    );
  });

  it("builds custom feature array conditions", () => {
    const result = buildContainerQueryString({
      customFeatures: {
        "custom-flag": ["on", "off"] as unknown as string,
      },
    });

    expect(result).toBe(
      "(custom-flag: on) and (custom-flag: off)",
    );
  });

  it("rejects custom feature arrays when allowQueryArrays is false", () => {
    const builder = createContainerQueryBuilder({
      emitBase: (props, helpers) =>
        emitCustomFeatures(props, helpers, { allowQueryArrays: false }),
    });

    expect(() =>
      builder({
        customFeatures: {
          "custom-flag": ["on", "off"] as unknown as string,
        },
      }),
    ).toThrow('Custom feature "custom-flag" does not allow arrays.');
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
