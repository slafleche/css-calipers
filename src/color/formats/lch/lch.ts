import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import { alphaSlot, hueOf, round, toLch } from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * lch — CIELCH (cylindrical CIELAB), unbounded gamut, float precision. Syntax-level,
 * so a fallback needs only an `@supports` probe; not a floor.
 *
 * See `lch.md`.
 */
export const lch = defineColorSpace({
  format: 'lch',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: '(color: lch(0 0 0))',
  gamutDependent: false,
  srgbFloor: false,
  render: (color: Color, cfg: ColorConfig): ColorString<'lch'> => {
    const c = toLch(color);
    return `lch(${round(c.l, 3)} ${round(c.c, 3)} ${hueOf(c.h)}${alphaSlot(color, cfg)})` as ColorString<'lch'>;
  },
});
