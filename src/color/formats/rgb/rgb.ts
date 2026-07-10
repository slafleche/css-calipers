import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import {
  alphaOf,
  channel255,
  fitGamut,
  hasRealAlpha,
  inSrgb,
  toRgb,
  violate,
} from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * rgb — the sRGB floor: 8-bit, no alpha, universally renderable.
 *
 * Fidelity: sRGB gamut, no alpha. Browser: universal, so no `@supports` probe, and
 * the fallback chain stops here (`srgbFloor`). An out-of-sRGB color is clamped
 * (strictness-governed); a real alpha can't be held and is a violation.
 *
 * See `rgb.md`.
 */
export const rgb = defineColorSpace({
  format: 'rgb',
  hasAlpha: false,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (color: Color, cfg: ColorConfig): ColorString<'rgb'> => {
    if (hasRealAlpha(color)) {
      violate(
        `color: alpha ${alphaOf(color)} dropped by 'rgb' (no alpha channel); use rgba or solid()`,
        cfg.strictness,
      );
    }
    const c = toRgb(fitGamut(color, inSrgb, 'rgb', cfg.strictness));
    return `rgb(${channel255(c.r)}, ${channel255(c.g)}, ${channel255(c.b)})` as ColorString<'rgb'>;
  },
});
