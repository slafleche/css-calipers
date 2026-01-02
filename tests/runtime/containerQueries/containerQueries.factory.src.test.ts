import { describe, expect, it } from "vitest";
import { compare } from "../../../src/comparisons";
import { m, r } from "../../../src";
import { containerQueryFactory } from "../../../src/containerQueries";

describe("containerQueries factory (src)", () => {
  it("defaults to full module coverage when modules are omitted", () => {
    const queries = {
      mixed: {
        query: {
          condition: {
            minWidth: m(40),
            inlineSize: compare.gte(m(24)),
            blockSize: compare.lt(m(60)),
            aspectRatio: r(16, 9),
            style: { display: "grid" },
            customFeatures: { "custom-flag": "on" },
          },
        },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "default-modules",
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    const result = factory({
      mixed: { padding: "8px" },
    });

    expect(result).toEqual({
      "@container": {
        "(min-width: 40px) and (aspect-ratio: 16/9) and (inline-size >= 24px) and (block-size < 60px) and (style(display: grid)) and (custom-flag: on)":
          { padding: "8px" },
      },
    });
  });

  it("matches output when modules are omitted vs explicitly provided", () => {
    const queries = {
      mixed: {
        query: {
          condition: {
            minWidth: m(40),
            inlineSize: compare.gte(m(24)),
            blockSize: compare.lt(m(60)),
            aspectRatio: r(16, 9),
            style: { display: "grid" },
            customFeatures: { "custom-flag": "on" },
          },
        },
      },
    };

    const factoryDefault = containerQueryFactory({
      queries,
      config: {
        label: "default-modules-parity",
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    const factoryExplicit = containerQueryFactory({
      queries,
      config: {
        label: "explicit-modules-parity",
        modules: [
          "core",
          "inline",
          "block",
          "aspectRatio",
          "style",
          "custom",
        ],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    const styles = {
      mixed: { padding: "8px" },
    };

    expect(factoryDefault(styles)).toEqual(factoryExplicit(styles));
  });

  it("errors with a module hint when core features are used without core", () => {
    const queries = {
      coreOnly: {
        query: { condition: { minWidth: m(30) } },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "no-core",
        modules: ["inline"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() => factory({ coreOnly: { padding: "8px" } })).toThrow(
      'Container query factory "no-core" received unsupported feature "minWidth". Add "core" to modules.',
    );
  });

  it("errors with a module hint when inline is missing", () => {
    const queries = {
      onlyInline: {
        query: { condition: { inlineSize: compare.gte(m(24)) } },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "no-inline",
        modules: ["core"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() => factory({ onlyInline: { padding: "8px" } })).toThrow(
      'Container query factory "no-inline" received unsupported feature "inlineSize". Add "inline" to modules.',
    );
  });

  it("errors with a module hint when block is missing", () => {
    const queries = {
      onlyBlock: {
        query: { condition: { blockSize: compare.gte(m(24)) } },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "no-block",
        modules: ["core"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() => factory({ onlyBlock: { padding: "8px" } })).toThrow(
      'Container query factory "no-block" received unsupported feature "blockSize". Add "block" to modules.',
    );
  });

  it("errors with a module hint when aspectRatio is missing", () => {
    const queries = {
      onlyAspectRatio: {
        query: { condition: { aspectRatio: r(16, 9) } },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "no-aspectRatio",
        modules: ["core"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() =>
      factory({ onlyAspectRatio: { padding: "8px" } }),
    ).toThrow(
      'Container query factory "no-aspectRatio" received unsupported feature "aspectRatio". Add "aspectRatio" to modules.',
    );
  });

  it("errors with a module hint when style is missing", () => {
    const queries = {
      onlyStyle: {
        query: { condition: { style: { display: "grid" } } },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "no-style",
        modules: ["core"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() => factory({ onlyStyle: { padding: "8px" } })).toThrow(
      'Container query factory "no-style" received unsupported feature "style". Add "style" to modules.',
    );
  });

  it("errors with a module hint when custom is missing", () => {
    const queries = {
      onlyCustom: {
        query: { condition: { customFeatures: { flag: "on" } } },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "no-custom",
        modules: ["core"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() => factory({ onlyCustom: { padding: "8px" } })).toThrow(
      'Container query factory "no-custom" received unsupported feature "customFeatures". Add "custom" to modules.',
    );
  });

  it("errors when duplicate conditions appear in and groups", () => {
    const queries = {
      duplicateInline: {
        query: {
          condition: {
            and: [
              { inlineSize: compare.gte(m(24)) },
              { inlineSize: compare.gte(m(24)) },
            ],
          },
        },
      },
    };

    const factory = containerQueryFactory({
      queries,
      config: {
        label: "duplicate-conditions",
        modules: ["inline"],
        errorHandling: { invalidValueMode: "throw", lintingMode: "log" },
      },
    });

    expect(() =>
      factory({ duplicateInline: { padding: "8px" } }),
    ).toThrow(
      'Container query factory "duplicate-conditions" received duplicate condition "inlineSize".',
    );
  });
});
