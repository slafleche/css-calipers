import type { FormatName } from '../types';
import { displayP3 } from './display-p3/display-p3';
import { hex } from './hex/hex';
import { hexAlpha } from './hexAlpha/hexAlpha';
import { hsl } from './hsl/hsl';
import { hwb } from './hwb/hwb';
import { lab } from './lab/lab';
import { lch } from './lch/lch';
import { oklab } from './oklab/oklab';
import { oklch } from './oklch/oklch';
import { rgb } from './rgb/rgb';
import { rgba } from './rgba/rgba';
import type { ColorSpaceDescriptor } from './types';

/**
 * The unified color-format registry: every built-in format's descriptor, keyed by
 * its format name. Each entry doubles as the book's output selector (it satisfies
 * `CssFormat`, having a `format`) and as the fallback descriptor (render + metadata).
 * Custom/experimental formats join a priority list via `defineColorSpace`, they do
 * not need to live here.
 */
export const colorFormats = {
  rgba,
  rgb,
  hex,
  hexAlpha,
  hsl,
  hwb,
  lab,
  lch,
  oklab,
  oklch,
  displayP3,
} satisfies Record<FormatName, ColorSpaceDescriptor>;

export type {
  ColorSpaceDescriptor,
  ColorString,
  Gamut,
} from './types';
export { defineColorSpace } from './types';
