import type { OutputFormat } from '../types';
import type { ColorSpaceDescriptor } from './types';

/**
 * Resolve an `output` entry to the descriptor that owns its render + fidelity bits.
 *
 * An `output` entry is already a full `ColorSpaceDescriptor` (e.g. `colorFormats.hex`
 * IS one), OR a bare `CssFormat` selector (`{ format: 'hex' }`). A CUSTOM format
 * authored via `defineColorSpace` carries an arbitrary `format` string, so it can
 * never be found by name in the built-in registry; it must be used as-is. So: if the
 * passed object already carries descriptor fields (it has a `render`), use it
 * directly; otherwise fall back to the registry by name. No global mutable registry,
 * the custom descriptor travels through the config object.
 */
export const asDescriptor = (
  format: OutputFormat,
  registry: Readonly<Record<string, ColorSpaceDescriptor<string>>>,
): ColorSpaceDescriptor<string> =>
  'render' in format ? format : registry[format.format];
