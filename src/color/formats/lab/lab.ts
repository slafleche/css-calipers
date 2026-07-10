import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import { alphaSlot, round, toLab } from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * lab — CIELAB, unbounded gamut (holds any color), float precision. Syntax-level
 * (browser gamut-maps to the display), so a fallback needs only an `@supports`
 * probe; not a floor.
 *
 * See `lab.md`.
 */
export const lab = defineColorSpace({
  format: 'lab',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: '(color: lab(0 0 0))',
  gamutDependent: false,
  srgbFloor: false,
  render: (color: Color, cfg: ColorConfig): ColorString<'lab'> => {
    const c = toLab(color);
    return `lab(${round(c.l, 3)} ${round(c.a, 3)} ${round(c.b, 3)}${alphaSlot(color, cfg)})` as ColorString<'lab'>;
  },
});
