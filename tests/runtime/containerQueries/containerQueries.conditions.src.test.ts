import { describe, expect, it } from "vitest";
import { m } from "../../../src";
import { compare } from "../../../src/comparisons";
import { buildContainerQueryString } from "../../../src/containerQueries";

describe("Container query condition builder (src)", () => {
  it("joins multiple conditions with and", () => {
    const query = buildContainerQueryString({
      inlineSize: compare.gte(m(28, "rem")),
      blockSize: compare.lt(m(40, "rem")),
    });

    expect(query).toBe(
      "(inline-size >= 28rem) and (block-size < 40rem)",
    );
  });
});
