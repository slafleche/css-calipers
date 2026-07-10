import type { Color } from 'culori';
import { clampChroma, converter } from 'culori';

import type { ColorConfig, Strictness } from '../types';

/**
 * Shared render toolkit for the per-format descriptors under `formats/` (and, for
 * now, for `../color.ts`'s `serialize`, which imports from here). Descriptors own
 * their render and build it from these; `serialize` will retire once every format
 * has a descriptor.
 */

const notRelease = (): boolean =>
  (globalThis as { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV !== 'production';

/**
 * Surface a "can't faithfully represent this" violation (dropped alpha,
 * out-of-gamut) per the strictness knob. `auto` = throw in dev / warn in prod.
 */
export const violate = (
  message: string,
  strictness: Strictness,
): void => {
  const mode =
    strictness === 'auto'
      ? notRelease()
        ? 'throw'
        : 'warn'
      : strictness;
  if (mode === 'throw') throw new Error(message);
  if (mode === 'warn') console.warn(message);
};

/** Round to `precision` decimal places (default 3). */
export const round = (value: number, precision = 3): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};
export const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));
export const channel255 = (value: number): number =>
  Math.round(clamp01(value) * 255);
/** Normalize a hue to `[0, 360)` at 2dp; a missing hue reads as 0. */
export const hueOf = (h: number | undefined): number =>
  round((((h ?? 0) % 360) + 360) % 360, 2);
export const pct = (value: number): number => round(value * 100, 2);
/** A color's alpha rounded to 3dp; a missing alpha is opaque (1). */
export const alphaOf = (color: Color): number =>
  round(color.alpha ?? 1, 3);

/**
 * The ` / <alpha>` slot for alpha-capable formats. Emitted unless the color is
 * opaque and the config drops opaque alpha (`omitOpaqueAlpha`).
 */
export const alphaSlot = (color: Color, cfg: ColorConfig): string => {
  const alpha = alphaOf(color);
  const dropOpaque = cfg.omitOpaqueAlpha && alpha === 1;
  return dropOpaque ? '' : ` / ${alpha}`;
};

export const toRgb = converter('rgb');
export const toHsl = converter('hsl');
export const toHwb = converter('hwb');
export const toLab = converter('lab');
export const toLch = converter('lch');
export const toOklab = converter('oklab');
export const toOklch = converter('oklch');
export const toP3 = converter('p3');

// Tolerant gamut check: a color round-tripped through OKLCH can drift a hair past a
// channel bound (sRGB `red` -> 1.0000001), so allow a tiny epsilon before calling it
// out-of-gamut. Genuinely out-of-gamut colors miss by far more.
const GAMUT_EPSILON = 1e-4;
const within01 = (n: number): boolean =>
  n >= -GAMUT_EPSILON && n <= 1 + GAMUT_EPSILON;
export const inSrgb = (color: Color): boolean => {
  const c = toRgb(color);
  return within01(c.r) && within01(c.g) && within01(c.b);
};
export const inP3 = (color: Color): boolean => {
  const c = toP3(color);
  return within01(c.r) && within01(c.g) && within01(c.b);
};

/** Bring a color into a target gamut, surfacing a violation if it wasn't inside. */
export const fitGamut = (
  color: Color,
  within: (c: Color) => boolean,
  gamut: 'rgb' | 'p3',
  strictness: Strictness,
): Color => {
  if (within(color)) {
    return color;
  }
  violate(
    `color: out of ${gamut === 'rgb' ? 'sRGB' : 'display-p3'} gamut; chroma clamped to fit`,
    strictness,
  );
  return clampChroma(color, 'oklch', gamut);
};

export const hasRealAlpha = (color: Color): boolean =>
  color.alpha !== undefined && color.alpha !== 1;
