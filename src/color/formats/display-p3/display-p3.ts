import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import { alphaSlot, fitGamut, inP3, round, toP3 } from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * display-p3 — wider-than-sRGB device RGB (the P3 gamut), with alpha. This is the
 * one gamut-DEPENDENT format: a fallback should also gate on
 * `@media (color-gamut: p3)`, since the wider color only shows on a P3 display. Out
 * of P3 is clamped (strictness-governed). Not a floor.
 *
 * See `display-p3.md`.
 */
export const displayP3 = defineColorSpace({
  format: 'displayP3',
  hasAlpha: true,
  gamut: 'p3',
  supportsProbe: '(color: color(display-p3 0 0 0))',
  gamutDependent: true,
  srgbFloor: false,
  render: (
    color: Color,
    cfg: ColorConfig,
  ): ColorString<'displayP3'> => {
    const c = toP3(fitGamut(color, inP3, 'p3', cfg.strictness));
    return `color(display-p3 ${round(c.r, 5)} ${round(c.g, 5)} ${round(c.b, 5)}${alphaSlot(color, cfg)})` as ColorString<'displayP3'>;
  },
});
