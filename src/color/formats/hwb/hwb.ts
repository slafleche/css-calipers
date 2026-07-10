import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import {
  alphaSlot,
  fitGamut,
  hueOf,
  inSrgb,
  pct,
  toHwb,
} from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * hwb — sRGB, alpha, higher precision. Newer than `hsl`/`rgb` (~96% support), so it
 * carries an `@supports` probe and is not treated as the safe floor. Out-of-sRGB is
 * clamped (strictness-governed).
 *
 * See `hwb.md`.
 */
export const hwb = defineColorSpace({
  format: 'hwb',
  hasAlpha: true,
  gamut: 'srgb',
  supportsProbe: '(color: hwb(0 0% 0%))',
  gamutDependent: false,
  srgbFloor: false,
  render: (color: Color, cfg: ColorConfig): ColorString<'hwb'> => {
    const c = toHwb(fitGamut(color, inSrgb, 'rgb', cfg.strictness));
    return `hwb(${hueOf(c.h)} ${pct(c.w)}% ${pct(c.b)}%${alphaSlot(color, cfg)})` as ColorString<'hwb'>;
  },
});
