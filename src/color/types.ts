import type { Property } from 'csstype';
import type { Color } from 'culori';

import type { DegMeasurement } from '../units/angle';
import type { ColorSpaceDescriptor } from './formats/types';

/**
 * The color book's TYPE contract: the live, library-agnostic surface for the
 * input + storage layers. Runtime lives in `./color.ts`, which re-exports these.
 *
 * The backing library (culori) is referenced only by the internal `Store.color`
 * shape; the author-facing types (`ColorInput`, `ColorObject`, `Symbolic*`) never
 * name it.
 */

/* ---------- structured object input (one per color space; `alpha` everywhere) ---------- */

export type ColorObject =
  | { space: 'rgb'; r: number; g: number; b: number; alpha?: number }
  | { space: 'hsl'; h: number; s: number; l: number; alpha?: number }
  | { space: 'hwb'; h: number; w: number; b: number; alpha?: number }
  | { space: 'lab'; l: number; a: number; b: number; alpha?: number }
  | { space: 'lch'; l: number; c: number; h: number; alpha?: number }
  | {
      space: 'oklab';
      l: number;
      a: number;
      b: number;
      alpha?: number;
    }
  | {
      space: 'oklch';
      l: number;
      c: number;
      h: number;
      alpha?: number;
    };

/** The color-space discriminants (`'rgb' | 'hsl' | ...`). */
export type ColorSpace = ColorObject['space'];

/* ---------- symbolic keywords (emit-only; no fixed value) ---------- */

export type CurrentColor = 'currentColor';

/** CSS Color 4 system colors (current). */
export type SystemColor =
  | 'Canvas'
  | 'CanvasText'
  | 'LinkText'
  | 'VisitedText'
  | 'ActiveText'
  | 'ButtonFace'
  | 'ButtonText'
  | 'ButtonBorder'
  | 'Field'
  | 'FieldText'
  | 'Highlight'
  | 'HighlightText'
  | 'SelectedItem'
  | 'SelectedItemText'
  | 'Mark'
  | 'MarkText'
  | 'GrayText'
  | 'AccentColor'
  | 'AccentColorText';

/** Deprecated system colors (Appendix A): valid values, accepted as passthrough. */
export type DeprecatedSystemColor =
  | 'ActiveBorder'
  | 'ActiveCaption'
  | 'AppWorkspace'
  | 'Background'
  | 'ButtonHighlight'
  | 'ButtonShadow'
  | 'CaptionText'
  | 'InactiveBorder'
  | 'InactiveCaption'
  | 'InactiveCaptionText'
  | 'InfoBackground'
  | 'InfoText'
  | 'Menu'
  | 'MenuText'
  | 'Scrollbar'
  | 'ThreeDDarkShadow'
  | 'ThreeDFace'
  | 'ThreeDHighlight'
  | 'ThreeDLightShadow'
  | 'ThreeDShadow'
  | 'Window'
  | 'WindowFrame'
  | 'WindowText';

/** CSS-wide cascade keywords: valid color values, accepted as passthrough. */
export type CascadeKeyword =
  | 'inherit'
  | 'initial'
  | 'unset'
  | 'revert'
  | 'revert-layer';

/** Any keyword with no fixed value (emit-only; modifying/converting it throws). */
export type SymbolicColor =
  | CurrentColor
  | SystemColor
  | DeprecatedSystemColor
  | CascadeKeyword;

/* ---------- the canonical store ---------- */

/**
 * The canonical store, shared by the input and storage steps.
 *
 * - `color` is a culori color object. It can be any mode after INPUT (parse), and
 *   is normalized to OKLCH after STORAGE. That OKLCH-only state is a runtime
 *   invariant (asserted by the storage tests), not encoded in the type: the engine
 *   ties input and storage to one `Store`, so `color` stays broad here.
 * - symbolic keywords carry no value and pass through untouched.
 */
export type Store =
  | { kind: 'color'; color: Color }
  | { kind: 'symbolic'; keyword: SymbolicColor };

/* ---------- author-facing input ---------- */

/**
 * What a color may be created from: a CSS string, a structured `ColorObject`, or an
 * existing `ResolvedColor` (re-wrap). All library-agnostic - culori is never named.
 */
export type ColorInput = string | ColorObject | ResolvedColor;

/* ============================================================================
 * OUTPUT (Part 3 of the book): formats, config, and the resolved result.
 * ==========================================================================*/

/** A CSS color value string. The `.css()` terminal returns this (csstype-typed). */
export type CssColor = Property.Color;

/**
 * A CSS color string hardened to the format that produced it. A specific format
 * selector (`color(x).hex()`) yields a value typed `ColorString<'hex'>`, so "this is
 * a hex color" survives in the type, not just at runtime. Stays assignable to a plain
 * `CssColor`.
 */
export type ColorString<F extends string = string> = CssColor & {
  readonly __colorFormat: F;
};

/**
 * The output formats. Every alpha-capable format always renders its alpha slot;
 * `rgb` / `hex` (hex6) carry no alpha and warn if they would drop a non-opaque one.
 */
export type CssFormat =
  | { format: 'rgba' }
  | { format: 'rgb' }
  | { format: 'hex' }
  | { format: 'hexAlpha' }
  | { format: 'hsl' }
  | { format: 'hwb' }
  | { format: 'lab' }
  | { format: 'lch' }
  | { format: 'oklab' }
  | { format: 'oklch' }
  | { format: 'displayP3' };

/** The format discriminants (`'rgba' | 'hex' | ...`). */
export type FormatName = CssFormat['format'];

/**
 * An entry in `ColorConfig.output`: either a built-in format selector (`CssFormat`,
 * e.g. `colorFormats.hex`) or a full custom descriptor authored via
 * `defineColorSpace`. A custom descriptor carries an arbitrary `format` string, so the
 * engine must resolve it from the passed object, not by a registry name lookup.
 */
export type OutputFormat = CssFormat | ColorSpaceDescriptor<string>;

/**
 * A custom colour-format PLUGIN: a full output descriptor (render + fidelity +
 * browser bits) that ALSO bridges the INPUT edge. Registered through `createColor`,
 * a plugin extends the pipeline at both edges while storage stays canonical OKLCH.
 *
 * `parse` recognizes and converts this format's INPUT into a culori `Color`; the
 * existing `storeColor` then normalizes it to OKLCH. Returning `undefined` declines
 * the input, so the next plugin (then the built-in parser) gets a chance. A plugin
 * therefore only claims inputs the built-ins reject (e.g. `'flamingo'`).
 */
export interface ColorFormatPlugin<
  F extends string = string,
> extends ColorSpaceDescriptor<F> {
  parse?: (input: string) => Color | undefined;
  /**
   * A browser-compatibility hook (output-edge). When this format's `render` emits a
   * token a downstream post-processor (Lightning CSS, via gilding) cannot understand,
   * the format declares HERE how to rewrite its own output into safe CSS. The gilding
   * finisher reads this off the `createColor` registry and runs it as a pre-step in
   * front of its core (the onion), instead of hard-coding a keyword map.
   *
   * Optional, so existing plugins are unaffected. Deliberately a plain string->string
   * transform: calipers takes on NO gilding dependency, and this is purely additive.
   * Calipers' own logic (parse / render / escalation) MUST NOT read this field.
   */
  fallback?: (css: string) => string;
}

/**
 * How a "can't faithfully represent this" violation is surfaced: dropping a real
 * alpha, out-of-gamut, or modifying a symbolic color. `auto` = throw in dev / warn
 * in prod.
 */
export type Strictness = 'auto' | 'throw' | 'warn' | 'silent';

/**
 * How a fully-transparent color (alpha 0) is rendered: the `transparent` keyword,
 * white at 0, black at 0, or `preserve` (the colour's own RGB at alpha 0, e.g.
 * `rgba(51, 102, 204, 0)`). `preserve` is the truest fade: it keeps the hue, so a
 * gradient toward it stays in-colour instead of drifting through black.
 */
export type TransparentRendering =
  | 'keyword'
  | 'white'
  | 'black'
  | 'preserve';

/**
 * The separable CSS blend modes: the per-channel formula modes from the W3C
 * compositing spec. They are defined on sRGB channels, so `blend()` applies them in
 * sRGB. The non-separable modes (`hue`, `saturation`, `color`, `luminosity`) are
 * intentionally excluded, they are not channel formulas.
 */
export type BlendMode =
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

/** The color book's config (factory-settable via `publishBookColor`). */
export interface ColorConfig {
  /**
   * What `.css()` renders with no argument: a single format, or a priority list that
   * escalates to the first format faithfully holding the color (simplest first). An
   * entry may be a built-in selector (`colorFormats.hex`) or a full custom descriptor
   * authored via `defineColorSpace`.
   */
  output: OutputFormat | ReadonlyArray<OutputFormat>;
  /** how violations are surfaced (strict by default; relaxed only in production). */
  strictness: Strictness;
  /**
   * How a fully-transparent color (alpha 0) renders: the `transparent` keyword,
   * white at 0, black at 0, or the colour's own RGB at 0 (`preserve`). This is the
   * default for any render; override it per result with `.transparentAs(mode)`.
   */
  transparent: TransparentRendering;
  /**
   * Drop the alpha slot when the color is fully opaque (alpha 1) for formats whose
   * alpha is optional (e.g. `rgba(...,1)` -> `rgb(...)`). Lossless. Off by default.
   */
  omitOpaqueAlpha: boolean;
}

/**
 * The resolved color: render via `.css()`, or pick a format. The selectors set the
 * format and return a new result; you still finish with `.css()`. Rendering only
 * ever happens through `.css()`.
 */
export interface ResolvedColor<F extends string = FormatName> {
  /** the single render terminal: a `ColorString<F>` in this result's configured
   * format. Argument-free: override the output beforehand via a named selector
   * (`.hex()`, `.oklch()`, ...) or `.formatAs(...)`, then finish with `.css()`. */
  css(): ColorString<F>;
  rgba(): ResolvedColor<'rgba'>;
  rgb(): ResolvedColor<'rgb'>;
  hex(): ResolvedColor<'hex'>;
  hexAlpha(): ResolvedColor<'hexAlpha'>;
  hsl(): ResolvedColor<'hsl'>;
  hwb(): ResolvedColor<'hwb'>;
  lab(): ResolvedColor<'lab'>;
  lch(): ResolvedColor<'lch'>;
  oklab(): ResolvedColor<'oklab'>;
  oklch(): ResolvedColor<'oklch'>;
  displayP3(): ResolvedColor<'displayP3'>;

  /**
   * Override the configured output format for THIS result, then finish with
   * `.css()`. Accepts a single `OutputFormat` (built-in selector or custom
   * descriptor) or a priority list that escalates to the first faithful format.
   * The ergonomic path for a built-in is its named selector (`.hex()`, `.oklch()`,
   * ...); `formatAs` is for a custom descriptor or a dynamic / list output.
   */
  formatAs(format: OutputFormat): ResolvedColor;
  formatAs(formats: ReadonlyArray<OutputFormat>): ResolvedColor;

  /**
   * Override how a fully-transparent colour (alpha 0) renders for THIS result,
   * winning over the configured `transparent` default (most-specific wins). A no-op
   * when the colour is not fully transparent. The output format threads through
   * unchanged, so it composes with the format selectors in any order.
   */
  transparentAs(mode: TransparentRendering): ResolvedColor<F>;

  /* modifications: immutable - each returns a NEW resolved color in the SAME format
   * (the configured output threads through). Amounts are 0..1 fractions, in OKLCH. */
  alpha: {
    (): number;
    (value: number): ResolvedColor<F>;
  };
  darken(amount?: number): ResolvedColor<F>;
  lighten(amount?: number): ResolvedColor<F>;
  brighten(amount?: number): ResolvedColor<F>;
  saturate(amount?: number): ResolvedColor<F>;
  desaturate(amount?: number): ResolvedColor<F>;
  hueShift(value: DegMeasurement): ResolvedColor<F>;
  /** Set the OKLCH lightness coordinate absolutely (0..1). */
  setLightness(value: number): ResolvedColor<F>;
  /** Set the OKLCH chroma coordinate absolutely (>= 0). */
  setChroma(value: number): ResolvedColor<F>;
  /** Set the OKLCH hue coordinate absolutely (degrees, wrapped to [0, 360)). */
  setHue(value: DegMeasurement): ResolvedColor<F>;
  /** Rotate the OKLCH hue by 180 degrees (the colour wheel opposite). */
  complement(): ResolvedColor<F>;
  /**
   * Invert the OKLCH lightness (`L -> 1 - L`), keeping chroma and hue. `amount`
   * (0..1) interpolates original <-> inverted; default `1` (full invert), and `0.5`
   * lands on mid lightness for any colour.
   */
  invert(amount?: number): ResolvedColor<F>;
  /**
   * Drop OKLCH chroma toward grey (`C -> C * (1 - amount)`), keeping lightness and
   * hue. `amount` (0..1); default `1` (fully desaturated grey).
   */
  grayscale(amount?: number): ResolvedColor<F>;
  /**
   * Blend `other` onto this colour with a separable blend mode. Blend modes are
   * sRGB-defined channel formulas, so the blend is computed in sRGB (a wide-gamut
   * operand is gamut-mapped to sRGB first); storage stays canonical OKLCH.
   */
  blend(other: ColorInput, mode: BlendMode): ResolvedColor<F>;
  /**
   * Adjust THIS colour's OKLCH lightness toward black or white until its WCAG 2.x
   * contrast against `other` reaches `ratio` (default `4.5`, WCAG AA; pass `7` for
   * AAA), moving the least amount needed. If the ratio is unreachable even at pure
   * black/white, returns the best-achievable (max-contrast) colour.
   */
  ensureContrast(other: ColorInput, ratio?: number): ResolvedColor<F>;
  /**
   * The WCAG 2.x relative-luminance contrast ratio between this colour and
   * `other` (1..21). A terminal (returns a number, like `alpha()`); on a symbolic
   * colour it is a violation and returns `NaN`.
   */
  contrast(other: ColorInput): number;
  mix(
    target: ColorInput,
    ratio?: number,
    mode?: ColorSpace,
  ): ResolvedColor<F>;
  mixSolid(
    target: ColorInput,
    ratio?: number,
    mode?: ColorSpace,
  ): ResolvedColor<F>;
  mixWithAlpha(
    target: ColorInput,
    ratio?: number,
    alpha?: number,
    mode?: ColorSpace,
  ): ResolvedColor<F>;
  solid(): ResolvedColor<F>;
  clone(): ResolvedColor<F>;
}
