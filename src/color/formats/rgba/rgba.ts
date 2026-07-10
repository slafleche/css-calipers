import type { Color } from 'culori';

import type { ColorConfig } from '../../types';
import {
  alphaOf,
  channel255,
  fitGamut,
  inSrgb,
  toRgb,
} from '../internals';
import type { ColorString } from '../types';
import { defineColorSpace } from '../types';

/**
 * rgba — sRGB with alpha (8-bit). Universal, so no `@supports` probe and a safe
 * floor. When the color is opaque and `omitOpaqueAlpha` is set it collapses to
 * `rgb(...)` (lossless), matching the book.
 *
 * See `rgba.md`.
 */
export const rgba = defineColorSpace({
  format: 'rgba',
  hasAlpha: true,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (color: Color, cfg: ColorConfig): ColorString<'rgba'> => {
    const alpha = alphaOf(color);
    const dropOpaque = cfg.omitOpaqueAlpha && alpha === 1;
    const c = toRgb(fitGamut(color, inSrgb, 'rgb', cfg.strictness));
    const body = `${channel255(c.r)}, ${channel255(c.g)}, ${channel255(c.b)}`;
    return (
      dropOpaque ? `rgb(${body})` : `rgba(${body}, ${alpha})`
    ) as ColorString<'rgba'>;
  },
});
