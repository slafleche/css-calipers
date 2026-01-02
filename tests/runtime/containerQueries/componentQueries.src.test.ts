import { describe, expect, it } from "vitest";
import type { IRatio } from "../../../src/ratio";
import { compare } from "../../../src/comparisons";
import { m, r } from "../../../src";
import { buildContainerQueryString } from "../../../src/containerQueries";

describe("componentQueries coverage (src)", () => {
  it("builds comparisons with multiple operators", () => {
    const result = buildContainerQueryString({
      inlineSize: compare.gt(m(20)),
      blockSize: compare.lte(m(48)),
    });

    expect(result).toBe("(inline-size > 20px) and (block-size <= 48px)");
  });

  it("combines conditions across modules", () => {
    const result = buildContainerQueryString({
      aspectRatio: r(16, 9),
      inlineSizeRange: {
        min: m(10),
        max: m(20),
        minOperator: "<=",
      },
      blockSize: compare.gte(m(30)),
      style: {
        display: "grid",
        gap: m(12),
      },
      customFeatures: {
        "data-density": "compact",
      },
    });

    expect(result).toBe(
      "(aspect-ratio: 16/9) and (10px <= inline-size) and (inline-size <= 20px) and (block-size >= 30px) and (style(display: grid)) and (style(gap: 12px)) and (data-density: compact)"
    );
  });

  it("uses r() values for aspect ratios", () => {
    const result = buildContainerQueryString({
      aspectRatio: r(3),
    });

    expect(result).toBe("(aspect-ratio: 3/1)");
  });

  it("rejects inline ranges where min is greater than max", () => {
    expect(() =>
      buildContainerQueryString({
        inlineSizeRange: {
          min: m(20),
          max: m(10),
          minOperator: "<=",
        },
      })
    ).toThrow(/inlineSizeRange min must be less than or equal to max/);
  });

  it("rejects aspect ratio values that are not ratios", () => {
    expect(() =>
      buildContainerQueryString({
        aspectRatio: "16/9" as unknown as IRatio,
      })
    ).toThrow(/aspectRatio must be a ratio created with r\(\)/);
  });

  it("rejects negative aspect ratios", () => {
    expect(() =>
      buildContainerQueryString({
        aspectRatio: r(-4, 3),
      })
    ).toThrow(/aspectRatio numerator must be greater than 0/);
  });

  it("rejects invalid style values", () => {
    expect(() =>
      buildContainerQueryString({
        style: {
          display: { invalid: true } as unknown as string,
        },
      })
    ).toThrow(/style\.display must be a primitive or measurement/);
  });

  it("rejects invalid custom feature names", () => {
    expect(() =>
      buildContainerQueryString({
        customFeatures: {
          "   ": "value",
        },
      })
    ).toThrow(/Custom feature name must be non-empty/);
  });

  it("rejects invalid custom feature values", () => {
    expect(() =>
      buildContainerQueryString({
        customFeatures: {
          density: { bad: true } as unknown as string,
        },
      })
    ).toThrow(/Custom feature "density" must be a primitive or a measurement/);
  });
});
