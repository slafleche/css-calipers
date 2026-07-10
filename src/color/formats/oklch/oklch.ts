import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import { alphaSlot, hueOf, round, toOklch } from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * oklch — the perceptual modern default (CSS Color 4).
 *
 * Fidelity: carries alpha; gamut is unbounded, so it can hold any color losslessly
 * from the OKLCH store (it is the storage space). Browser: a syntax-level format, so
 * a fallback needs only an `@supports` probe, not `@media (color-gamut)`, and it is
 * not an sRGB floor. Render is a direct read of l / c / h, hardened to
 * `ColorString<'oklch'>`.
 *
 * See `oklch.md` for the format's tests and possible fallbacks.
 */
export const oklch = defineColorSpace({
  format: 'oklch',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: '(color: oklch(0 0 0))',
  gamutDependent: false,
  srgbFloor: false,
  render: (color: Color, cfg: ColorConfig): ColorString<'oklch'> => {
    const c = toOklch(color);
    return `oklch(${round(c.l, 4)} ${round(c.c, 4)} ${hueOf(c.h)}${alphaSlot(color, cfg)})` as ColorString<'oklch'>;
  },
});
