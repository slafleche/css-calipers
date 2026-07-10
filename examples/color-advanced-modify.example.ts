/**
 * Example-only file. Not part of the public API surface and not published.
 *
 * The richer colour modifications beyond darken/lighten: separable BLEND modes,
 * WCAG contrast LIFTING, desaturation, inversion, and cloning. Each returns a NEW
 * resolved colour (values are immutable), so you navigate/modify and then render
 * through `.css()`.
 */
import { color } from '@css-bookends/css-calipers';

const brand = color('#3366cc');

// blend(other, mode): a separable W3C blend mode, computed in sRGB.
export const multiplied = brand.blend('#ff9900', 'multiply').css(); // '#333d00'
export const screened = brand.blend('#ff9900', 'screen').css(); // '#ffc2cc'

// ensureContrast(background, ratio): lift THIS colour until it meets the WCAG ratio
// against `background`. A light grey fails 4.5:1 on white, so it is darkened until it passes.
export const readableOnWhite = color('#999999')
  .ensureContrast('#ffffff', 4.5)
  .css(); // '#777777'

// grayscale(amount = 1): desaturate; a partial amount interpolates original <-> grey.
export const grey = brand.grayscale().css(); // '#6c6c6c'
export const halfGrey = brand.grayscale(0.5).css(); // '#526c9d'

// invert(amount = 1): 0.5 lands on the mid-point between the colour and its inverse.
export const inverted = brand.invert().css(); // '#2152b6'
export const halfInverted = brand.invert(0.5).css(); // '#2a5cc1'

// clone(): an independent copy that renders identically.
export const isIndependentCopy = brand.clone().css() === brand.css(); // true
