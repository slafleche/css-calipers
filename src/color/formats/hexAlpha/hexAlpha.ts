import type { Color } from 'culori';
import { formatHex8 } from 'culori';

import type { ColorConfig } from '../../types';
import { fitGamut, inSrgb, toRgb } from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * hexAlpha — sRGB with alpha, 8-bit (`#rrggbbaa`). The alpha counterpart of `hex`;
 * universal, a safe floor, always carries the alpha byte. Out-of-sRGB is clamped
 * (strictness-governed).
 *
 * See `hexAlpha.md`.
 */
export const hexAlpha = defineColorSpace({
  format: 'hexAlpha',
  hasAlpha: true,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (
    color: Color,
    cfg: ColorConfig,
  ): ColorString<'hexAlpha'> => {
    const c = toRgb(fitGamut(color, inSrgb, 'rgb', cfg.strictness));
    return formatHex8(c) as ColorString<'hexAlpha'>;
  },
});
