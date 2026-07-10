/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates the optional
 * `fallback` hook on a `ColorFormatPlugin`: a plain `(css: string) => string` transform
 * a custom format declares to rewrite its OWN output into browser-safe CSS.
 *
 * IMPORTANT: the `fallback` hook is a browser-compatibility seam that calipers itself
 * NEVER reads. Calipers' parse / render / escalation logic must not touch it. It exists
 * for the gilding finisher: gilding's `composeCoreFromFormats` reads this off the
 * `createColor` registry and runs it as a pre-step in front of its core, so a format
 * that emits a token a downstream post-processor (Lightning CSS, via gilding) cannot
 * understand can describe how to downgrade itself. The field is deliberately additive:
 * a plugin without it is unaffected, and calipers takes on no gilding dependency.
 *
 * The "brandedColor" format here is a deliberately minimal illustration, not a real or
 * recommended format. See custom-format.example.ts for a fuller plugin that bridges the
 * input edge too.
 */

import {
  type ColorConfig,
  type ColorFormatPlugin,
  type ColorString,
} from '@css-bookends/css-calipers';
import { type Color, formatRgb } from 'culori';

// A custom format that renders a stored colour and tags it with a CSS custom property,
// so its raw output (`var(--brand, <rgb>)`) is something a downstream tool might want
// flattened for older targets.
export const brandedColor: ColorFormatPlugin<'brandedColor'> = {
  format: 'brandedColor',
  hasAlpha: true,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  // output: render the stored OKLCH colour to rgb, wrapped in a branded custom property.
  render: (
    color: Color,
    _cfg: ColorConfig,
  ): ColorString<'brandedColor'> =>
    `var(--brand, ${formatRgb(color)})` as ColorString<'brandedColor'>,
  // browser-compat hook (output edge): strip the `var(...)` wrapper down to the bare
  // rgb fallback. Consumed by gilding's composeCoreFromFormats, NOT by calipers itself.
  fallback: (css: string): string =>
    css.replace(/^var\(--brand, (.+)\)$/, '$1'),
};

// The hook is a plain string -> string transform; here is what gilding would invoke.
export const downgraded = brandedColor.fallback?.(
  'var(--brand, rgb(51, 102, 204))',
); // 'rgb(51, 102, 204)'

// A plugin WITHOUT the hook is equally valid: `fallback` is optional and purely
// additive, so existing formats are unaffected.
export const minimal: ColorFormatPlugin<'minimal'> = {
  format: 'minimal',
  hasAlpha: false,
  gamut: 'srgb',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: true,
  render: (color: Color, _cfg: ColorConfig): ColorString<'minimal'> =>
    formatRgb(color) as ColorString<'minimal'>,
};
export const hasNoFallback = minimal.fallback === undefined; // true
