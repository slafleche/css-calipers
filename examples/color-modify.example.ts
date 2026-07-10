/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It expands the colour surface
 * beyond color-input.example.ts:
 *
 *   - constructing from a structured `ColorObject` (`{ space: 'rgb', r, g, b }`, ...);
 *   - the strictness policy (throw vs silent) when `.rgb()` would drop a real alpha;
 *   - `omitOpaqueAlpha` (an opaque colour drops the optional alpha slot);
 *   - the modification algebra: contrast, complement, setLightness / setChroma /
 *     setHue, hueShift, desaturate, brighten, mix / mixSolid / mixWithAlpha, solid;
 *   - symbolic keyword passthrough (`currentColor`, ...).
 *
 * Modifications are immutable: each returns a NEW resolved colour in the same configured
 * format. Amounts are 0..1 fractions applied in OKLCH; hue uses a `DegMeasurement`.
 */

import {
  color,
  type ColorObject,
  mDeg,
} from '@css-bookends/css-calipers';

// --- construct from a structured ColorObject ------------------------------------

// rgb channels are 0-255; hsl / hwb use percentages; lab / lch / oklab / oklch are 1:1.
// #3366cc as an rgb object.
export const fromRgbObject = color({
  space: 'rgb',
  r: 51,
  g: 102,
  b: 204,
}).css(); // '#3366cc'

// The optional `alpha` slot carries through. An rgb object cannot render as bare `hex`
// (it would drop the alpha), so escalation lands on the rgba slot.
export const fromRgbObjectWithAlpha = color({
  space: 'rgb',
  r: 51,
  g: 102,
  b: 204,
  alpha: 0.5,
})
  .rgba()
  .css(); // 'rgba(51, 102, 204, 0.5)'

// An oklch object (channels 1:1 with the OKLCH coordinates).
const oklchInput: ColorObject = {
  space: 'oklch',
  l: 0.7,
  c: 0.1,
  h: 200,
};
export const fromOklchObject = color(oklchInput).oklch().css();

// --- strictness: throw vs silent on a lossy render ------------------------------

// `.rgb()` cannot carry alpha. On a translucent colour that is a violation: under the
// default strictness ('auto') it THROWS in dev.
export const strictDropThrows = (): string => {
  try {
    color('#3366cc80').rgb().css();
    return 'no throw';
  } catch (error) {
    return error instanceof Error ? error.message : 'unknown';
  }
};

// `strictness: 'silent'` drops the alpha without complaint.
export const silentDrop = color('#3366cc80', { strictness: 'silent' })
  .rgb()
  .css(); // 'rgb(51, 102, 204)'

// --- omitOpaqueAlpha: an opaque colour drops the optional alpha slot -------------

// With the flag on, a fully-opaque colour rendered through rgba drops to rgb (lossless).
export const opaqueDropsAlpha = color('#3366cc', {
  omitOpaqueAlpha: true,
})
  .rgba()
  .css(); // 'rgb(51, 102, 204)'

// A translucent colour keeps its real alpha; the flag only affects the OPAQUE case.
export const translucentKeepsAlpha = color('#3366cc80', {
  omitOpaqueAlpha: true,
})
  .rgba()
  .css(); // 'rgba(51, 102, 204, 0.502)'

// --- modifications: contrast (a terminal, returns a number) ---------------------

// WCAG 2.x contrast ratio (1..21). Black on white is the maximum.
export const maxContrast = color('black').contrast('white'); // 21

// Reading a colour's contrast against white (a real number in [1, 21]).
export const blueContrast = color('#3366cc').contrast('white');

// --- modifications: OKLCH coordinate setters ------------------------------------

// `setLightness` writes the OKLCH L coordinate absolutely (0..1).
export const litColor = color('#3366cc')
  .setLightness(0.42)
  .oklch()
  .css();

// `setChroma` writes the OKLCH C coordinate absolutely (>= 0).
export const chromaColor = color('#3366cc')
  .setChroma(0.08)
  .oklch()
  .css();

// `setHue` writes the OKLCH H coordinate absolutely (degrees).
export const huedColor = color('#3366cc')
  .setHue(mDeg(120))
  .oklch()
  .css();

// `complement` rotates the hue 180 degrees (the colour-wheel opposite).
export const complementColor = color('#3366cc')
  .complement()
  .oklch()
  .css();

// `hueShift` rotates the hue by a relative amount.
export const shiftedColor = color('#3366cc')
  .hueShift(mDeg(90))
  .oklch()
  .css();

// --- modifications: lightness / chroma adjustments ------------------------------

// `brighten` is an alias of `lighten`; rendered through a format it is opaque rgba.
export const brightened = color('#3366cc').brighten(0.2).rgba().css();

// `desaturate` lowers the OKLCH chroma.
export const desaturated = color('#3366cc')
  .desaturate(0.5)
  .oklch()
  .css();

// --- modifications: mixing ------------------------------------------------------

// `mix` blends toward a target (default ratio 0.5, in OKLCH).
export const mixed = color('white').mix('black').oklch().css();

// `mixSolid` yields an OPAQUE result even from a translucent base.
export const mixedSolidAlpha = color('#3366cc80')
  .mixSolid('red')
  .alpha(); // 1

// `mixWithAlpha` sets the result's alpha explicitly.
export const mixedAlpha = color('#3366cc')
  .mixWithAlpha('red', 0.5, 0.3)
  .alpha(); // ~0.3

// `solid` forces the alpha to 1.
export const solidAlpha = color('#3366cc80').solid().alpha(); // 1

// --- symbolic keyword passthrough -----------------------------------------------

// A keyword with no fixed value (currentColor, system colours, cascade keywords) passes
// through `.css()` untouched. Modifying or converting one is a violation.
export const passthrough = color('currentColor').css(); // 'currentColor'
