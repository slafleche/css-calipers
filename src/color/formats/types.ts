import type { Color } from 'culori';

import type { ColorConfig, ColorString, FormatName } from '../types';

// `ColorString<F>` (the per-format output brand) is defined in `../types`, next to
// `CssColor`; re-exported here so descriptors and the registry import it locally.
export type { ColorString };

/** The gamut a format can represent, widening `srgb` ⊂ `p3` ⊂ `unbounded`. */
export type Gamut = 'srgb' | 'p3' | 'unbounded';

/**
 * A color-format descriptor: how to render the format from the canonical OKLCH
 * store, plus the metadata its two readers need.
 *
 * - **fidelity** (`hasAlpha`, `gamut`): the color book reads these to pick the
 *   single simplest format that faithfully holds a color (the output escalation).
 * - **browser** (`supportsProbe`, `gamutDependent`, `srgbFloor`): a separate
 *   fallback helper reads these to assemble multi-declaration browser fallbacks.
 *
 * `render` returns a `ColorString<F>` so each format's output is hardened to its
 * own type. Built-ins use a `FormatName`; a custom format (via `defineColorSpace`)
 * uses any string and is then usable in the priority list / fallback chain.
 */
export interface ColorSpaceDescriptor<F extends string = FormatName> {
  /** the format's key; also keys it in the registry and brands its output. */
  readonly format: F;
  /** render a stored (OKLCH) color to this format's CSS value, typed to the brand. */
  readonly render: (color: Color, cfg: ColorConfig) => ColorString<F>;
  /** fidelity: whether the format carries an alpha channel. */
  readonly hasAlpha: boolean;
  /** fidelity: the gamut the format can represent. */
  readonly gamut: Gamut;
  /**
   * browser: the `@supports` test that detects parse-support (e.g.
   * `'(color: oklch(0 0 0))'`), or `null` for a universally-supported format.
   */
  readonly supportsProbe: string | null;
  /**
   * browser: whether a fallback should also gate on `@media (color-gamut: ...)`
   * (e.g. `display-p3`). Syntax-only modern formats (`oklch`, `lab`) are `false`.
   */
  readonly gamutDependent: boolean;
  /** browser: a safe sRGB floor; the fallback chain stops here. */
  readonly srgbFloor: boolean;
}

/**
 * Author a color-format descriptor (built-in or custom/experimental). A thin
 * identity that pins the type and infers the format brand `F`, so a new format can
 * be registered for the priority list / fallback chain without the library shipping
 * it.
 */
export const defineColorSpace = <F extends string>(
  descriptor: ColorSpaceDescriptor<F>,
): ColorSpaceDescriptor<F> => descriptor;
