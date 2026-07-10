/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates the
 * fully-transparent (alpha 0) rendering policy: how a colour at alpha 0 renders, set
 * either as config (`color(input, { transparent: ... })`) or per-render via
 * `.transparentAs(mode)`. The default ladder is `[hex, rgba, oklch]`, so an alpha-0
 * colour escalates past no-alpha `hex` to the `rgba` slot, where the policy applies.
 *
 * Modes:
 *   - `keyword`  (default): the `transparent` keyword.
 *   - `white`             : white at alpha 0 (sidesteps the old-Safari gradient quirk).
 *   - `black`             : black at alpha 0.
 *   - `preserve`          : the colour's own RGB at alpha 0 (the truest fade: keeps the
 *                           hue, so a gradient toward it stays in-colour).
 */

import { color } from '@css-bookends/css-calipers';

// --- the config form: { transparent: mode } -------------------------------------

// Default config -> the 'transparent' keyword.
export const keyword = color('#3366cc').alpha(0).css(); // 'transparent'

// white at alpha 0, under the rgba slot.
export const whiteZero = color('#3366cc', { transparent: 'white' })
  .alpha(0)
  .css(); // 'rgba(255, 255, 255, 0)'

// black at alpha 0, under the rgba slot.
export const blackZero = color('#3366cc', { transparent: 'black' })
  .alpha(0)
  .css(); // 'rgba(0, 0, 0, 0)'

// --- the per-render override: .transparentAs(mode) ------------------------------

// The method wins over the config default (most-specific wins): config says 'keyword',
// the method forces white at alpha 0.
export const overrideToWhite = color('#3366cc')
  .alpha(0)
  .transparentAs('white')
  .css(); // 'rgba(255, 255, 255, 0)'

// And the other way: a configured 'white' default forced back to the keyword.
export const overrideToKeyword = color('#3366cc', {
  transparent: 'white',
})
  .alpha(0)
  .transparentAs('keyword')
  .css(); // 'transparent'

// 'preserve' keeps the colour's OWN rgb at alpha 0 (here #3366cc -> 51, 102, 204).
export const preserved = color('#3366cc')
  .alpha(0)
  .transparentAs('preserve')
  .rgba()
  .css(); // 'rgba(51, 102, 204, 0)'

// --- applies across every alpha-capable format, not just rgba -------------------

const faded = color('#3366cc').alpha(0);

// hexAlpha renders white at alpha 0 in its own syntax.
export const fadedHexAlpha = faded
  .hexAlpha()
  .transparentAs('white')
  .css(); // '#ffffff00'

// rgba renders white at alpha 0 too.
export const fadedRgba = faded.rgba().transparentAs('white').css(); // 'rgba(255, 255, 255, 0)'

// --- no-op when the colour is not fully transparent -----------------------------

// Opaque: the policy never fires, so the solid renders normally.
export const opaqueUnaffected = color('#3366cc')
  .transparentAs('white')
  .css(); // '#3366cc'

// Partial alpha is not alpha 0, so the override is inert; the real alpha renders.
export const partialUnaffected = color('#3366cc')
  .alpha(0.5)
  .transparentAs('white')
  .css(); // 'rgba(51, 102, 204, 0.5)'
