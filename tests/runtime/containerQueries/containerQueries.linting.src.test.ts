import { describe, expect, it, vi } from "vitest";
import { m, r } from "../../../src";
import {
  buildContainerRange,
  createContainerQueryBuilder,
} from "../../../src/containerQueries/helpers";
import type { IContainerQueryCore } from "../../../src/containerQueries/containerQueries";
import { emitInlineSizeFeatures } from "../../../src/containerQueries/modules/inline";
import type { IContainerQueryInline } from "../../../src/containerQueries/modules/inline";
import { emitAspectRatioFeatures } from "../../../src/containerQueries/modules/aspectRatio";
import type { IContainerQueryAspectRatio } from "../../../src/containerQueries/modules/aspectRatio";
import { emitBlockSizeFeatures } from "../../../src/containerQueries/modules/block";
import type { IContainerQueryBlock } from "../../../src/containerQueries/modules/block";
import { emitStyleFeatures } from "../../../src/containerQueries/modules/style";
import type { IContainerQueryStyle } from "../../../src/containerQueries/modules/style";
import { emitCoreFeatures } from "../../../src/containerQueries/containerQueries";
import { compare } from "../../../src/comparisons";

describe("containerQueries linting + validation (src)", () => {
  it("throws on invalid values when invalidValueMode is throw", () => {
    const builder = createContainerQueryBuilder<IContainerQueryInline>({
      emitBase: (props, helpers) =>
        emitInlineSizeFeatures(
          props,
          helpers,
          () => "invalid inline size",
        ),
      config: { errorHandling: { invalidValueMode: "throw" } },
    });

    expect(() =>
      builder({
        inlineSize: compare.gte(m(10)),
      }),
    ).toThrow(
      "Container query inline validation failed: invalid inline size",
    );
  });

  it("logs and allows invalid values when invalidValueMode is log", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const builder = createContainerQueryBuilder<IContainerQueryInline>({
      emitBase: (props, helpers) =>
        emitInlineSizeFeatures(
          props,
          helpers,
          () => "invalid inline size",
        ),
      config: { errorHandling: { invalidValueMode: "log" } },
    });

    const result = builder({
      inlineSize: compare.gte(m(10)),
    });

    expect(result).toBe("(inline-size >= 10px)");
    expect(warn).toHaveBeenCalledWith(
      "Container query inline validation failed: invalid inline size",
    );
    warn.mockRestore();
  });

  it("throws on linting failures when lintingMode is throw", () => {
    const builder = createContainerQueryBuilder<IContainerQueryInline>({
      emitBase: (props, helpers) => emitInlineSizeFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        inlineSize: compare.gte(m(10)),
        inlineSizeRange: buildContainerRange(m(5), m(15)),
      }),
    ).toThrow(
      "inlineSize should not be combined with inlineSizeRange",
    );
  });

  it("warns on redundant core min/max width", () => {
    const builder = createContainerQueryBuilder<IContainerQueryCore>({
      emitBase: (props, helpers) => emitCoreFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        minWidth: m(24),
        maxWidth: m(24),
      }),
    ).toThrow(
      "minWidth should not be combined with maxWidth when both are equal",
    );
  });

  it("warns on redundant core min/max height", () => {
    const builder = createContainerQueryBuilder<IContainerQueryCore>({
      emitBase: (props, helpers) => emitCoreFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        minHeight: m(24),
        maxHeight: m(24),
      }),
    ).toThrow(
      "minHeight should not be combined with maxHeight when both are equal",
    );
  });

  it("warns on collapsed inline ranges", () => {
    const builder = createContainerQueryBuilder<IContainerQueryInline>({
      emitBase: (props, helpers) => emitInlineSizeFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        inlineSizeRange: buildContainerRange(m(24), m(24)),
      }),
    ).toThrow(
      "inlineSizeRange min and max are equal; use inlineSize instead",
    );
  });

  it("warns on collapsed block ranges", () => {
    const builder = createContainerQueryBuilder<IContainerQueryBlock>({
      emitBase: (props, helpers) => emitBlockSizeFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        blockSizeRange: buildContainerRange(m(24), m(24)),
      }),
    ).toThrow(
      "blockSizeRange min and max are equal; use blockSize instead",
    );
  });

  it("warns on collapsed aspect ratio ranges", () => {
    const builder = createContainerQueryBuilder<IContainerQueryAspectRatio>({
      emitBase: (props, helpers) =>
        emitAspectRatioFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        minAspectRatio: r(4, 3),
        maxAspectRatio: r(4, 3),
      }),
    ).toThrow(
      "minAspectRatio and maxAspectRatio are equal; use aspectRatio instead",
    );
  });

  it("logs and allows linting failures when lintingMode is log", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const builder = createContainerQueryBuilder<IContainerQueryInline>({
      emitBase: (props, helpers) => emitInlineSizeFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "log" } },
    });

    const result = builder({
      inlineSize: compare.gte(m(10)),
      inlineSizeRange: buildContainerRange(m(5), m(15)),
    });

    expect(result).toContain("(inline-size");
    expect(warn).toHaveBeenCalledWith(
      "inlineSize should not be combined with inlineSizeRange",
    );
    warn.mockRestore();
  });

  it("rejects comparison-shaped style values", () => {
    const builder = createContainerQueryBuilder<IContainerQueryStyle>({
      emitBase: (props, helpers) => emitStyleFeatures(props, helpers),
      config: { errorHandling: { lintingMode: "throw" } },
    });

    expect(() =>
      builder({
        style: {
          width: compare.gte(m(10)) as unknown as string,
        },
      }),
    ).toThrow(/style\.width must be a primitive or measurement/);
  });
});
