import { describe, expect, it } from "vitest";
import { m } from "../../../src";
import { buildContainerQueryString } from "../../../src/containerQueries";

describe("Container query condition builder (src)", () => {
  it("joins multiple conditions with and", () => {
    const query = buildContainerQueryString({
      inlineSize: { operator: ">=", value: m(28, "rem") },
      blockSize: { operator: "<", value: m(40, "rem") },
    });

    expect(query).toBe(
      "(inline-size >= 28rem) and (block-size < 40rem)",
    );
  });
});
