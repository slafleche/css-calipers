import { describe, expect, it } from "vitest";
import {
  fractionToFloat,
  isFraction,
  normalizeFraction,
  parseRatio,
  r,
  reduceFraction,
  simplifyFraction,
} from "../../../src";

describe("Fraction helper (src)", () => {
  it("creates fractions with implied denominator", () => {
    const fraction = r(4);
    expect(fraction.numerator()).toBe(4);
    expect(fraction.denominator()).toBe(1);
    expect(fraction.css()).toBe("4/1");
    expect(fraction.toString()).toBe("4/1");
    expect(fraction.valueOf()).toBe(4);
  });

  it("creates fractions with explicit numerator and denominator", () => {
    const fraction = r(3, 5);
    expect(fraction.numerator()).toBe(3);
    expect(fraction.denominator()).toBe(5);
    expect(fraction.css()).toBe("3/5");
    expect(fraction.valueOf()).toBe(0.6);
  });

  it("creates new fractions when replacing numerator or denominator", () => {
    const base = r(2, 3);
    const withNumerator = base.withNumerator(4);
    const withDenominator = base.withDenominator(5);

    expect(base.css()).toBe("2/3");
    expect(withNumerator.css()).toBe("4/3");
    expect(withDenominator.css()).toBe("2/5");
  });

  it("detects fractions", () => {
    expect(isFraction(r(2, 3))).toBe(true);
    expect(isFraction({})).toBe(false);
    expect(isFraction(null)).toBe(false);
  });

  it("parses ratio inputs", () => {
    expect(parseRatio(2)).toEqual({ numerator: 2, denominator: 1 });
    expect(parseRatio(-2)).toEqual({ numerator: -2, denominator: 1 });
    expect(parseRatio("3/4")).toEqual({
      numerator: 3,
      denominator: 4,
    });
    expect(parseRatio("-3/4")).toEqual({
      numerator: -3,
      denominator: 4,
    });
    expect(parseRatio("3/-4")).toEqual({
      numerator: 3,
      denominator: -4,
    });
    expect(parseRatio("1.5")).toEqual({
      numerator: 1.5,
      denominator: 1,
    });
    expect(parseRatio(r(5, 6))).toEqual({
      numerator: 5,
      denominator: 6,
    });
    expect(parseRatio("")).toBeNull();
    expect(parseRatio("   ")).toBeNull();
    expect(parseRatio("bad")).toBeNull();
    expect(parseRatio("1/0")).toBeNull();
    expect(parseRatio("1/NaN")).toBeNull();
    expect(parseRatio("Infinity")).toBeNull();
    expect(parseRatio(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it("normalizes integer fractions", () => {
    expect(normalizeFraction(r(2, 4)).css()).toBe("1/2");
    expect(normalizeFraction(r(-2, -4)).css()).toBe("1/2");
    expect(normalizeFraction(r(-2, 4)).css()).toBe("-1/2");
  });

  it("keeps non-integer fractions as-is", () => {
    const normalized = normalizeFraction(r(1.5, 3.5));
    expect(normalized.css()).toBe("1.5/3.5");
  });

  it("reduces fractions without altering css output style", () => {
    expect(reduceFraction(r(6, 3)).css()).toBe("2/1");
    expect(reduceFraction(r(5)).css()).toBe("5/1");
  });

  it("simplifies fractions and omits denominator when it becomes 1", () => {
    expect(simplifyFraction(r(5)).css()).toBe("5");
    expect(simplifyFraction(r(6, 3)).css()).toBe("2");
    expect(simplifyFraction(r(21, 7)).css()).toBe("3");
  });

  it("converts fractions to floating point values", () => {
    expect(fractionToFloat(r(1, 4))).toBe(0.25);
    expect(fractionToFloat(r(3, 2))).toBe(1.5);
  });

  it("rejects invalid values", () => {
    expect(() => r(Number.NaN)).toThrow(
      "Fraction values must be finite numbers.",
    );
    expect(() => r(2, 0)).toThrow("Fraction denominator cannot be zero.");
    expect(() => normalizeFraction(r(Number.NaN))).toThrow(
      "Fraction values must be finite numbers.",
    );
    expect(() => normalizeFraction(r(2, 0))).toThrow(
      "Fraction denominator cannot be zero.",
    );
  });
});
