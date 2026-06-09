/**
 * Example-only file.
 *
 * This is not part of the public API surface and is not published in the
 * package. It exists to demonstrate one way to normalize mixed line-height
 * inputs into a single value with a `.css()` method. See the README for a
 * deeper discussion of this pattern and its trade-offs.
 */

import type * as csstype from 'csstype';
import { isMeasurement, m } from '@css-bookends/css-calipers';

type LineHeightInput = number | string;

// A "CSS-like" wrapper for line-height: an object that knows how to emit
// a value compatible with the `lineHeight` style property when `.css()` is
// called, regardless of the original input shape.
interface LineHeightCssLike {
  css(): csstype.Property.LineHeight;
}

const parseNumericWithUnit = (
  raw: string,
): { value: number; unit: string } | null => {
  const value = raw.trim();
  const match = value.match(/^(-?\d*\.?\d+)\s*(px|rem|em|%)$/i);
  if (!match) return null;
  const [, numeric, unit] = match;
  return {
    value: Number(numeric),
    unit: unit.toLowerCase(),
  };
};

export const normalizeLineHeight = (
  value: LineHeightInput,
): LineHeightCssLike => {
  // Case 1: bare number (unitless line-height)
  if (typeof value === 'number') {
    return {
      css: () => value as unknown as csstype.Property.LineHeight,
    };
  }

  const trimmed = value.trim();

  // Case 2: numeric value + unit string (for example, "1.5rem", "20px")
  const numericWithUnit = parseNumericWithUnit(trimmed);
  if (numericWithUnit) {
    const measurement = m(numericWithUnit.value, numericWithUnit.unit);
    return measurement;
  }

  // Case 3: unitless numeric string (for example, "1.5")
  const numericValue = Number(trimmed);
  if (!Number.isNaN(numericValue)) {
    return {
      css: () => numericValue as unknown as csstype.Property.LineHeight,
    };
  }

  // Case 4: keywords ("normal") or CSS variables ("var(--body-line-height)")
  // remain opaque CSS strings and resolve at runtime.
  return {
    css: () => trimmed as csstype.Property.LineHeight,
  };
};

// Example usages (not executed here; for illustration only):
const lineHeightFromNumber = normalizeLineHeight(1.5);
const lineHeightFromUnitString = normalizeLineHeight('1.5rem');
const lineHeightFromNumericString = normalizeLineHeight('1.5');
const lineHeightFromKeyword = normalizeLineHeight('normal');
const lineHeightFromVar = normalizeLineHeight('var(--body-line-height)');

// All normalized values expose a `.css()` method:
const lineHeightStyles: Record<string, csstype.Property.LineHeight> = {
  number: lineHeightFromNumber.css(),
  unitString: lineHeightFromUnitString.css(),
  numericString: lineHeightFromNumericString.css(),
  keyword: lineHeightFromKeyword.css(),
  cssVariable: lineHeightFromVar.css(),
};

// Advanced example: if the normalized value happens to be a CSS-Calipers
// measurement, you can safely do math on it before emitting CSS.
const baseLineHeight = normalizeLineHeight('1.4rem');
const minLineHeight = m(1.2, 'rem');
const maxLineHeight = m(1.8, 'rem');

let clampedLineHeight: csstype.Property.LineHeight;

if (isMeasurement(baseLineHeight)) {
  // Here TypeScript knows `baseLineHeight` is an IMeasurement, so you can use
  // unit-aware helpers before emitting.
  const clamped = baseLineHeight.clamp(minLineHeight, maxLineHeight);
  clampedLineHeight = clamped.css() as csstype.Property.LineHeight;
} else {
  // Keywords or CSS variables bypass CSS-Calipers and stay as-is.
  clampedLineHeight = baseLineHeight.css();
}
