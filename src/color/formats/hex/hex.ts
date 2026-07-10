import type { Color } from 'culori';
import { formatHex } from 'culori';

import type { ColorConfig } from '../../types';
import {
  alphaOf,
  fitGamut,
  hasRealAlpha,
  inSrgb,
  toRgb,
  violate,
} from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * hex — sRGB, no alpha, 8-bit (`#rrggbb`). The most compact universal form; a safe
 * floor with no `@supports` probe. A real alpha can't be held and is a violation
 * (use `hexAlpha`); out-of-sRGB is clamped (strictness-governed).
 *
 * See `hex.md`.
 */
export const hex = defineColorSpace({
  format: 'hex',
  hasAlpha: false,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (color: Color, cfg: ColorConfig): ColorString<'hex'> => {
    if (hasRealAlpha(color)) {
      violate(
        `color: alpha ${alphaOf(color)} dropped by 'hex' (no alpha channel); use hexAlpha or solid()`,
        cfg.strictness,
      );
    }
    const c = toRgb(fitGamut(color, inSrgb, 'rgb', cfg.strictness));
    return formatHex(c) as ColorString<'hex'>;
  },
});
