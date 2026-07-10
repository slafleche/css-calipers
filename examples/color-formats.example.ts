/**
 * Example-only file. Not part of the public API surface and not published.
 *
 * The colour output format SELECTORS. One bound colour, rendered through each
 * built-in format. Storage stays canonical OKLCH; a selector only chooses how the
 * final `.css()` string is emitted, so you pick the format at the render edge and
 * never restate the colour. Each selector returns the navigable resolved colour
 * (not a string), so you always finish with `.css()`. (Opaque colours keep their
 * ` / 1` alpha slot unless `omitOpaqueAlpha` is set on the colour config.)
 */
import { color } from '@css-bookends/css-calipers';

const brand = color('#3366cc');

export const asHex = brand.hex().css(); // '#3366cc'
export const asHsl = brand.hsl().css(); // 'hsl(220 60% 50% / 1)'
export const asHwb = brand.hwb().css(); // 'hwb(220 20% 20% / 1)'
export const asLab = brand.lab().css(); // 'lab(44.121 10.954 -59.086 / 1)'
export const asLch = brand.lch().css(); // 'lch(44.121 60.093 280.5 / 1)'
export const asOklab = brand.oklab().css(); // 'oklab(0.5325 -0.0225 -0.1663 / 1)'
export const asOklch = brand.oklch().css(); // 'oklch(0.5325 0.1679 262.29 / 1)'
export const asDisplayP3 = brand.displayP3().css(); // 'color(display-p3 0.24985 0.39524 0.77356 / 1)'
