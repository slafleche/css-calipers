import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import {
  alphaSlot,
  fitGamut,
  hueOf,
  inSrgb,
  pct,
  toHsl,
} from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * hsl — sRGB, alpha, higher precision than 8-bit. Universal, so no `@supports` probe
 * and a safe floor. Out-of-sRGB is clamped (strictness-governed).
 *
 * See `hsl.md`.
 */
export const hsl = defineColorSpace({
  format: 'hsl',
  hasAlpha: true,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (color: Color, cfg: ColorConfig): ColorString<'hsl'> => {
    const c = toHsl(fitGamut(color, inSrgb, 'rgb', cfg.strictness));
    return `hsl(${hueOf(c.h)} ${pct(c.s)}% ${pct(c.l)}%${alphaSlot(color, cfg)})` as ColorString<'hsl'>;
  },
});
