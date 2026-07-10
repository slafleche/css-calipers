/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates the
 * `color()` input primitive: parse a CSS color, modify it immutably in OKLCH
 * (`.darken()`, `.lighten()`, ...), pick an output format, and render through
 * `.css()`.
 */

import { color, colorFormats } from '@css-bookends/css-calipers';

// Parse a hex color, darken it by 20% (a 0..1 fraction, applied in OKLCH), then
// render. With no .css() argument the simplest faithful format is chosen.
export const darkened = color('#3366cc').darken(0.2).css();

// A format selector returns a NEW resolved color in that format; you still
// finish with .css(). Here the same color is forced to hex.
export const asHex = color('#3366cc').hex().css();

// Equivalently, override the output via formatAs(...), then finish with .css().
export const asHexInline = color('#3366cc')
  .formatAs(colorFormats.hex)
  .css();

// Modifications chain immutably: each step returns a new resolved color in the
// same configured format.
export const adjusted = color('#3366cc')
  .darken(0.1)
  .saturate(0.2)
  .css();

// A real CSS-authoring use: derive a hover shade from a base color.
export const hoverShade = (base: string): string =>
  color(base).darken(0.15).css();
