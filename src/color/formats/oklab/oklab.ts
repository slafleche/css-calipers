import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import { alphaSlot, round, toOklab } from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * oklab — OKLab (rectangular), unbounded gamut, float precision. Perceptual, like
 * `oklch` but in a/b coordinates. Syntax-level, so a fallback needs only an
 * `@supports` probe; not a floor.
 *
 * See `oklab.md`.
 */
export const oklab = defineColorSpace({
  format: 'oklab',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: '(color: oklab(0 0 0))',
  gamutDependent: false,
  srgbFloor: false,
  render: (color: Color, cfg: ColorConfig): ColorString<'oklab'> => {
    const c = toOklab(color);
    return `oklab(${round(c.l, 4)} ${round(c.a, 4)} ${round(c.b, 4)}${alphaSlot(color, cfg)})` as ColorString<'oklab'>;
  },
});
