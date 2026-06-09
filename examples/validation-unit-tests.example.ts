/**
 * Example-only file.
 *
 * Not part of the public API surface or published bundle. This sketch shows
 * how to exercise a simple design-token invariant in unit tests using Vitest,
 * which this repo already uses for its own test suite. The pattern is test-
 * runner agnostic; you can adapt it to Jest, Mocha, or any other framework.
 */

import { describe, it } from "vitest";
import { m, assertMatchingUnits } from "@css-bookends/css-calipers";

// Pretend these spacing tokens come from a design token file or configuration
// layer. The intent is a simple invariant: small <= large and both share units.
const spacingTokens = {
  spaceSm: m(4), // defaults to "px" if no unit is given
  spaceLg: m(12),
};

describe("spacing tokens (example unit test)", () => {
  it("use the same unit for related tokens", () => {
    const { spaceSm, spaceLg } = spacingTokens;

    // Unit consistency between related tokens.
    assertMatchingUnits(
      spaceSm,
      spaceLg,
      "spacing tokens: spaceSm and spaceLg must share units"
    );
  });

  it("keep small <= large", () => {
    const { spaceSm, spaceLg } = spacingTokens;

    // Ordering invariant: small should never exceed large.
    const smValue = spaceSm.getValue();
    const lgValue = spaceLg.getValue();

    if (!(smValue <= lgValue)) {
      throw new Error(
        `spacing tokens out of order: ` +
          `spaceSm=${spaceSm.css()}, spaceLg=${spaceLg.css()}`
      );
    }
  });
});
