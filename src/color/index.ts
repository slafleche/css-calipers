// The colour VALUE primitive: a native typed CSS input alongside `m()`, `r()`,
// `i()`, `f()`. Parse a `ColorInput` into an OKLCH store, then resolve it to an
// immutable, navigable `ResolvedColor` (modify via `.darken()` / `.mix()` / ...,
// render via `.css()`). This module carries ZERO self-publish coupling; the
// `publishBook`-based colour BOOK lives in `@css-bookends/color`.
import type {
  Color,
  Hsl,
  Hwb,
  Lab,
  Lch,
  Oklab,
  Oklch,
  Rgb,
} from 'culori';
import {
  blend as blendColors,
  interpolate,
  parse,
  toGamut,
  wcagContrast,
} from 'culori';

import type { DegMeasurement } from '../units/angle';
import {
  colorFormats,
  type ColorSpaceDescriptor,
  defineColorSpace,
  type Gamut,
} from './formats';
import { chooseFormat } from './formats/escalate';
import {
  alphaOf,
  clamp01,
  toOklch,
  violate,
} from './formats/internals';
import { asDescriptor } from './formats/resolve';
import type {
  BlendMode,
  ColorConfig,
  ColorFormatPlugin,
  ColorInput,
  ColorObject,
  ColorSpace,
  CssColor,
  CssFormat,
  FormatName,
  OutputFormat,
  ResolvedColor,
  Store,
  SymbolicColor,
  TransparentRendering,
} from './types';

export * from './types';

/* A resolved color privately carries its store here so it can be re-wrapped by
 * `parseColor` (lib-agnostic: this holds our `Store`, never a culori name). */
const STORED = Symbol('color.store');

/* ============================================================================
 * INPUT (Part 1 of the book): parse a `ColorInput` into the canonical store.
 *
 * The store is the boundary between input and the rest of the book. Translatable
 * values become a culori color object; symbolic keywords are kept verbatim and
 * pass through on emit (modifying them throws later, not here). Storage
 * normalization and output formatting are separate, later steps.
 * ==========================================================================*/

/* The symbolic allowlist, in canonical casing. Runtime mirror of the
 * `Symbolic*` types; `satisfies` keeps each entry a valid keyword. */
const SYMBOLIC_KEYWORDS = [
  'currentColor',
  // system colors (current, CSS Color 4)
  'Canvas',
  'CanvasText',
  'LinkText',
  'VisitedText',
  'ActiveText',
  'ButtonFace',
  'ButtonText',
  'ButtonBorder',
  'Field',
  'FieldText',
  'Highlight',
  'HighlightText',
  'SelectedItem',
  'SelectedItemText',
  'Mark',
  'MarkText',
  'GrayText',
  'AccentColor',
  'AccentColorText',
  // system colors (deprecated, Appendix A - still accepted)
  'ActiveBorder',
  'ActiveCaption',
  'AppWorkspace',
  'Background',
  'ButtonHighlight',
  'ButtonShadow',
  'CaptionText',
  'InactiveBorder',
  'InactiveCaption',
  'InactiveCaptionText',
  'InfoBackground',
  'InfoText',
  'Menu',
  'MenuText',
  'Scrollbar',
  'ThreeDDarkShadow',
  'ThreeDFace',
  'ThreeDHighlight',
  'ThreeDLightShadow',
  'ThreeDShadow',
  'Window',
  'WindowFrame',
  'WindowText',
  // CSS-wide cascade keywords
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
] as const satisfies readonly SymbolicColor[];

/** lower-cased keyword -> canonical casing, for case-insensitive matching. */
const SYMBOLIC_BY_LOWER = new Map<string, SymbolicColor>(
  SYMBOLIC_KEYWORDS.map((keyword) => [
    keyword.toLowerCase(),
    keyword,
  ]),
);

const isColorObject = (
  input: ColorInput | Color,
): input is ColorObject =>
  typeof input === 'object' && input !== null && 'space' in input;

const isCuloriColor = (input: ColorInput | Color): input is Color =>
  typeof input === 'object' && input !== null && 'mode' in input;

const cloneStore = (store: Store): Store =>
  store.kind === 'symbolic'
    ? { kind: 'symbolic', keyword: store.keyword }
    : { kind: 'color', color: { ...store.color } };

/**
 * Adapt a structured `ColorObject` to a culori color object. We accept
 * CSS-authoring ranges (rgb 0-255, hsl/hwb percentages 0-100) and convert them
 * to culori's normalized ranges; lab/lch/oklab/oklch channels are 1:1.
 */
const colorObjectToCulori = (input: ColorObject): Color => {
  switch (input.space) {
    case 'rgb': {
      const color: Rgb = {
        mode: 'rgb',
        r: input.r / 255,
        g: input.g / 255,
        b: input.b / 255,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
    case 'hsl': {
      const color: Hsl = {
        mode: 'hsl',
        h: input.h,
        s: input.s / 100,
        l: input.l / 100,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
    case 'hwb': {
      const color: Hwb = {
        mode: 'hwb',
        h: input.h,
        w: input.w / 100,
        b: input.b / 100,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
    case 'lab': {
      const color: Lab = {
        mode: 'lab',
        l: input.l,
        a: input.a,
        b: input.b,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
    case 'lch': {
      const color: Lch = {
        mode: 'lch',
        l: input.l,
        c: input.c,
        h: input.h,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
    case 'oklab': {
      const color: Oklab = {
        mode: 'oklab',
        l: input.l,
        a: input.a,
        b: input.b,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
    case 'oklch': {
      const color: Oklch = {
        mode: 'oklch',
        l: input.l,
        c: input.c,
        h: input.h,
      };
      if (input.alpha !== undefined) color.alpha = input.alpha;
      return color;
    }
  }
};

/**
 * A plugin-aware string parser: tries the built-in parse FIRST (symbolic keyword,
 * then culori CSS parse), and only if that declines tries each plugin's `parse` in
 * order. Returns a `Store` or `undefined` to decline. Built-in precedence is intact;
 * a plugin only ever claims a string the built-ins reject. The module-level parser is
 * this with no plugins; a factory instance binds its own plugin list.
 */
const parseString = (
  input: string,
  plugins: ReadonlyArray<ColorFormatPlugin>,
): Store | undefined => {
  const canonical = SYMBOLIC_BY_LOWER.get(input.toLowerCase());
  if (canonical !== undefined) {
    return { kind: 'symbolic', keyword: canonical };
  }
  const builtIn = parse(input);
  if (builtIn !== undefined) {
    return { kind: 'color', color: builtIn };
  }
  // built-ins declined: offer the string to each plugin's input bridge, in order.
  for (const plugin of plugins) {
    const bridged = plugin.parse?.(input);
    if (bridged !== undefined) {
      return { kind: 'color', color: bridged };
    }
  }
  return undefined;
};

/**
 * Parse any `ColorInput` into the canonical store, optionally consulting custom
 * format plugins for strings the built-ins reject.
 *
 * - string: a symbolic keyword (case-insensitive) -> passthrough store; otherwise
 *   parsed as a CSS color; if that declines, each plugin's `parse` is tried; an input
 *   no one claims throws.
 * - structured `ColorObject` -> adapted to a culori color.
 * - re-wrap: an existing culori color (internal/engine use) -> reused as-is.
 */
const parseInput = (
  input: ColorInput | Color,
  plugins: ReadonlyArray<ColorFormatPlugin>,
): Store => {
  if (typeof input === 'string') {
    const store = parseString(input, plugins);
    if (store === undefined) {
      throw new Error(`color: unparseable color string "${input}"`);
    }
    return store;
  }

  // re-wrap: an existing ResolvedColor carries its store privately.
  if (
    typeof input === 'object' &&
    input !== null &&
    STORED in input
  ) {
    return cloneStore((input as { [STORED]: Store })[STORED]);
  }

  if (isColorObject(input)) {
    return { kind: 'color', color: colorObjectToCulori(input) };
  }

  if (isCuloriColor(input)) {
    return { kind: 'color', color: input };
  }

  throw new Error('color: unsupported color input');
};

/**
 * Parse any `ColorInput` into the canonical store (built-in formats only). The public,
 * instance-agnostic parser. Factory instances thread their own plugin-aware parser
 * internally; this stays the bare built-in entry point.
 */
export const parseColor = (input: ColorInput | Color): Store =>
  parseInput(input, []);

/* ============================================================================
 * STORAGE (Part 2 of the book): normalize the canonical store.
 *
 * Every translatable color is converted to OKLCH, so the rest of the book works
 * from one perceptually-uniform representation: modifications become direct
 * coordinate edits (l/c/h), and outputs convert out of OKLCH. Symbolic keywords
 * have no value to normalize and pass through untouched.
 *
 * This is pure culori math and runs anywhere JS runs - it needs no browser
 * `oklch()` support. Browser compatibility is purely an output-step concern
 * (which format you emit), not a storage concern.
 * ==========================================================================*/

/** Normalize a parsed store into the canonical OKLCH working space. */
export const storeColor = (store: Store): Store => {
  if (store.kind === 'symbolic') {
    return store;
  }
  return { kind: 'color', color: toOklch(store.color) };
};

/* ============================================================================
 * OUTPUT (Part 3 of the book): render the store in any format; build the result.
 *
 * The store is OKLCH; output converts OUT of it with culori and serializes. Every
 * alpha-capable format always renders its alpha slot; `rgb`/`hex` carry no alpha.
 * "Can't faithfully represent this" cases (dropped alpha, out-of-gamut) are
 * surfaced via the strictness knob (throw in dev / warn in prod by default), with a
 * best-effort value (clamped chroma) still produced in the warn case.
 * ==========================================================================*/

// The unified format registry (each entry a descriptor: render + metadata) lives in
// `./formats`; re-export it (plus the descriptor authoring surface) so `colorFormats.hex`
// stays the public output selector and custom formats can be defined.
export {
  colorFormats,
  type ColorSpaceDescriptor,
  defineColorSpace,
  type Gamut,
};

// Render a (non-fully-transparent) color in the requested format by dispatching to
// that format's descriptor. The descriptors own the per-format render; this single
// dispatch replaced the old per-format switch.
const serialize = (
  color: Color,
  format: OutputFormat,
  cfg: ColorConfig,
): string => asDescriptor(format, colorFormats).render(color, cfg);

const renderColor = (
  color: Color,
  format: OutputFormat,
  cfg: ColorConfig,
): string => {
  // fully-transparent rendering policy (alpha 0): a keyword, or white/black at 0.
  if (alphaOf(color) === 0) {
    if (cfg.transparent === 'keyword') return 'transparent';
    // `preserve`: keep the colour's own RGB at alpha 0 (the truest fade), i.e.
    // render the stored colour as-is, exactly like a non-transparent value.
    if (cfg.transparent === 'preserve') {
      return serialize(color, format, cfg);
    }
    const substitute: Color =
      cfg.transparent === 'white'
        ? { mode: 'rgb', r: 1, g: 1, b: 1, alpha: 0 }
        : { mode: 'rgb', r: 0, g: 0, b: 0, alpha: 0 };
    return serialize(substitute, format, cfg);
  }
  return serialize(color, format, cfg);
};

const render = (
  store: Store,
  output: OutputFormat | ReadonlyArray<OutputFormat>,
  cfg: ColorConfig,
): CssColor => {
  // symbolic colors pass through: their keyword emits for any requested format.
  if (store.kind === 'symbolic') {
    return store.keyword;
  }
  // resolve the output (a single format, or a priority list) to one faithful format.
  const format = chooseFormat(store.color, output);
  return renderColor(store.color, format, cfg);
};

const wrapHue = (h: number): number => ((h % 360) + 360) % 360;

/* Map a colour into the sRGB gamut (a no-op for in-gamut colours). Separable blend
 * modes are sRGB-defined, so a wide-gamut operand is mapped here before blending; an
 * in-gamut colour passes through losslessly. */
const toSrgbGamut = toGamut('rgb', 'oklch');

/**
 * The instance binding threaded through `resolveWith`: the plugin-aware input parser
 * (so internal re-parses such as mix targets stay self-consistent with the factory
 * instance) and the plugin list (so named format selectors can be exposed). The
 * module-level `resolve` binds the built-in parser and no plugins.
 */
interface ResolveBinding {
  readonly parse: (input: ColorInput | Color) => Store;
  readonly plugins: ReadonlyArray<ColorFormatPlugin>;
}

const builtInBinding: ResolveBinding = {
  parse: parseColor,
  plugins: [],
};

const resolveWith = <F extends string = FormatName>(
  store: Store,
  cfg: ColorConfig,
  binding: ResolveBinding,
): ResolvedColor<F> => {
  // a format selector: same color, new configured output, still finished via .css().
  const withFormat = (output: OutputFormat): ResolvedColor =>
    resolveWith(store, { ...cfg, output }, binding);
  // a transparency selector: same colour and format, new alpha-0 render policy.
  const withTransparent = (
    transparent: TransparentRendering,
  ): ResolvedColor =>
    resolveWith(store, { ...cfg, transparent }, binding);
  // a modification: a NEW color (re-normalized to OKLCH), same config.
  const withColor = (raw: Color): ResolvedColor =>
    resolveWith(
      storeColor({ kind: 'color', color: raw }),
      cfg,
      binding,
    );
  const self = (): ResolvedColor => resolveWith(store, cfg, binding);

  // modifications are only valid on a translatable color; on a symbolic keyword
  // they are a violation (throw in dev / warn in prod) and leave the color as-is.
  const modifiable = (op: string): Oklch | undefined => {
    if (store.kind === 'symbolic') {
      violate(
        `color: cannot ${op} a symbolic color '${store.keyword}'`,
        cfg.strictness,
      );
      return undefined;
    }
    return store.color as Oklch;
  };

  const targetColor = (target: ColorInput): Color | undefined => {
    const resolved = storeColor(binding.parse(target));
    if (resolved.kind !== 'color') {
      violate(
        'color: cannot mix with a symbolic color',
        cfg.strictness,
      );
      return undefined;
    }
    return resolved.color;
  };

  const blend = (
    op: string,
    target: ColorInput,
    ratio: number,
    mode: ColorSpace,
    makeBaseSolid: boolean,
  ): Color | undefined => {
    const c = modifiable(op);
    if (c === undefined) return undefined;
    const t = targetColor(target);
    if (t === undefined) return undefined;
    const base = makeBaseSolid ? { ...c, alpha: 1 } : c;
    return interpolate(
      [
        base,
        t,
      ],
      mode,
    )(clamp01(ratio));
  };

  // a separable blend: compose `target` onto this colour with a sRGB-defined blend
  // mode. Both operands are gamut-mapped into sRGB (a no-op for in-gamut colours) and
  // blended there; the result is re-normalized to OKLCH by `withColor`.
  const applyBlend = (
    op: string,
    target: ColorInput,
    mode: BlendMode,
  ): Color | undefined => {
    const c = modifiable(op);
    if (c === undefined) return undefined;
    const t = targetColor(target);
    if (t === undefined) return undefined;
    return blendColors(
      [
        toSrgbGamut(c),
        toSrgbGamut(t),
      ],
      mode,
      'rgb',
    );
  };

  // adjust this colour's OKLCH lightness toward black/white to reach a WCAG contrast
  // ratio against `target`, moving the least amount needed. Used by `ensureContrast`.
  const liftToContrast = (
    base: Oklch,
    target: Color,
    ratio: number,
  ): Oklch => {
    const at = (l: number): number =>
      wcagContrast({ ...base, l }, target);
    // already sufficient: leave it.
    if (at(base.l) >= ratio) return base;
    // pick the endpoint (black L=0 or white L=1) that yields the most contrast.
    const endpoint = at(1) >= at(0) ? 1 : 0;
    // unreachable even at the endpoint: return the best-achievable colour.
    if (at(endpoint) < ratio) return { ...base, l: endpoint };
    // contrast is monotonic between base.l and the endpoint: binary-search the
    // smallest move that still meets the ratio. `lo` stays insufficient, `hi`
    // sufficient, regardless of numeric direction.
    let lo = base.l;
    let hi = endpoint;
    for (let i = 0; i < 40; i += 1) {
      const mid = (lo + hi) / 2;
      if (at(mid) >= ratio) hi = mid;
      else lo = mid;
    }
    return { ...base, l: hi };
  };

  // a format override selector: same colour, new configured output (a single
  // format or a priority list), still finished via .css(). Mirrors `withFormat`
  // and `withTransparent`; the output threads straight into `cfg.output`.
  const formatAs = (
    formats: OutputFormat | ReadonlyArray<OutputFormat>,
  ): ResolvedColor =>
    resolveWith(store, { ...cfg, output: formats }, binding);

  const result = {
    css: () => render(store, cfg.output, cfg),
    formatAs,
    rgba: () => withFormat(colorFormats.rgba),
    rgb: () => withFormat(colorFormats.rgb),
    hex: () => withFormat(colorFormats.hex),
    hexAlpha: () => withFormat(colorFormats.hexAlpha),
    hsl: () => withFormat(colorFormats.hsl),
    hwb: () => withFormat(colorFormats.hwb),
    lab: () => withFormat(colorFormats.lab),
    lch: () => withFormat(colorFormats.lch),
    oklab: () => withFormat(colorFormats.oklab),
    oklch: () => withFormat(colorFormats.oklch),
    displayP3: () => withFormat(colorFormats.displayP3),
    transparentAs: (mode: TransparentRendering) =>
      withTransparent(mode),

    alpha: ((value?: number) => {
      if (value === undefined) {
        return store.kind === 'color' ? (store.color.alpha ?? 1) : 1;
      }
      const c = modifiable('set the alpha of');
      return c === undefined
        ? self()
        : withColor({ ...c, alpha: value });
    }) as ResolvedColor['alpha'],

    darken: (amount = 0.1) => {
      const c = modifiable('darken');
      return c === undefined
        ? self()
        : withColor({ ...c, l: c.l * (1 - clamp01(amount)) });
    },
    lighten: (amount = 0.1) => {
      const c = modifiable('lighten');
      return c === undefined
        ? self()
        : withColor({ ...c, l: c.l + (1 - c.l) * clamp01(amount) });
    },
    brighten: (amount = 0.1) => result.lighten(amount),
    saturate: (amount = 0.1) => {
      const c = modifiable('saturate');
      return c === undefined
        ? self()
        : withColor({ ...c, c: c.c * (1 + Math.max(0, amount)) });
    },
    desaturate: (amount = 0.1) => {
      const c = modifiable('desaturate');
      return c === undefined
        ? self()
        : withColor({ ...c, c: c.c * (1 - clamp01(amount)) });
    },
    hueShift: (value: DegMeasurement) => {
      const c = modifiable('hue-shift');
      return c === undefined
        ? self()
        : withColor({
            ...c,
            h: wrapHue((c.h ?? 0) + value.getValue()),
          });
    },
    setLightness: (value: number) => {
      const c = modifiable('set the lightness of');
      return c === undefined ? self() : withColor({ ...c, l: value });
    },
    setChroma: (value: number) => {
      const c = modifiable('set the chroma of');
      return c === undefined ? self() : withColor({ ...c, c: value });
    },
    setHue: (value: DegMeasurement) => {
      const c = modifiable('set the hue of');
      return c === undefined
        ? self()
        : withColor({ ...c, h: wrapHue(value.getValue()) });
    },
    complement: () => {
      const c = modifiable('complement');
      return c === undefined
        ? self()
        : withColor({ ...c, h: wrapHue((c.h ?? 0) + 180) });
    },
    invert: (amount = 1) => {
      const c = modifiable('invert');
      if (c === undefined) return self();
      const a = clamp01(amount);
      // L + ((1 - L) - L) * a; a=1 -> 1 - L, a=0.5 -> 0.5 for any L.
      return withColor({ ...c, l: c.l + (1 - 2 * c.l) * a });
    },
    grayscale: (amount = 1) => {
      const c = modifiable('grayscale');
      return c === undefined
        ? self()
        : withColor({ ...c, c: c.c * (1 - clamp01(amount)) });
    },
    blend: (other: ColorInput, mode: BlendMode) => {
      const blended = applyBlend('blend', other, mode);
      return blended === undefined ? self() : withColor(blended);
    },
    ensureContrast: (other: ColorInput, ratio = 4.5) => {
      const c = modifiable('ensure the contrast of');
      if (c === undefined) return self();
      const t = targetColor(other);
      if (t === undefined) return self();
      return withColor(liftToContrast(c, t, ratio));
    },
    contrast: (other: ColorInput): number => {
      const c = modifiable('measure the contrast of');
      if (c === undefined) return Number.NaN;
      const t = targetColor(other);
      if (t === undefined) return Number.NaN;
      return wcagContrast(c, t);
    },

    mix: (
      target: ColorInput,
      ratio = 0.5,
      mode: ColorSpace = 'oklch',
    ) => {
      const mixed = blend('mix', target, ratio, mode, false);
      return mixed === undefined ? self() : withColor(mixed);
    },
    mixSolid: (
      target: ColorInput,
      ratio = 0.5,
      mode: ColorSpace = 'oklch',
    ) => {
      const mixed = blend('mix', target, ratio, mode, true);
      return mixed === undefined ? self() : withColor(mixed);
    },
    mixWithAlpha: (
      target: ColorInput,
      ratio = 0.5,
      alpha?: number,
      mode: ColorSpace = 'oklch',
    ) => {
      const c = modifiable('mix');
      if (c === undefined) return self();
      const mixed = blend('mix', target, ratio, mode, true);
      if (mixed === undefined) return self();
      return withColor({ ...mixed, alpha: alpha ?? c.alpha ?? 1 });
    },

    solid: () => {
      const c = modifiable('solidify');
      return c === undefined ? self() : withColor({ ...c, alpha: 1 });
    },
    clone: () => self(),
  };

  // carry the store privately so this result can be re-wrapped via `color(result)`.
  Object.defineProperty(result, STORED, { value: store });

  // Named custom-format selectors: one lazy getter per registered plugin (e.g.
  // `.zoo`), mirroring the built-in format selectors and the `transparentAs` chain.
  // Lazy (a getter, not an eager property) so a child result is built only on access,
  // avoiding eager construction recursion. Each returns this same colour reconfigured
  // to render through that plugin's descriptor.
  for (const plugin of binding.plugins) {
    Object.defineProperty(result, plugin.format, {
      enumerable: false,
      get: () => withFormat(plugin),
    });
  }

  return result as unknown as ResolvedColor<F>;
};

/**
 * Resolve a store + config into an immutable, navigable `ResolvedColor`, using the
 * built-in parser and no custom plugins. The public, instance-agnostic resolver
 * (re-exported as `resolveColor`). Factory instances use `resolveWith` internally to
 * thread their own plugin-aware parser and named selectors.
 */
export const resolve = <F extends FormatName = FormatName>(
  store: Store,
  cfg: ColorConfig,
): ResolvedColor<F> => resolveWith<F>(store, cfg, builtInBinding);

/**
 * The default output priority: the simplest faithful format first. With no argument
 * `.css()` escalates down this ladder to the first format that holds the color (see
 * `formats/README.md`). Overridable per book via `publishBookColor({ config })`.
 *
 * Pared to one format per distinct output space, most popular first (see
 * `docs/color-format-popularity.md`). Every other built-in format is a redundant
 * cover of one of these three, so it would never win escalation; it stays reachable
 * via a named selector (`.hwb()`, ...) or `.formatAs(colorFormats.x)`.
 *   - `hex`:   solids (opaque sRGB). ~76% of real-world colour declarations.
 *   - `rgba`:  translucent sRGB. The dominant alpha form (rgba >> #rrggbbaa, hsla).
 *   - `oklch`: the unbounded floor, holds any colour (P3 and beyond), and is the
 *              primitive's own storage space, so it is the zero-loss fallback.
 */
export const defaultFormatPriority: CssFormat[] = [
  colorFormats.hex,
  colorFormats.rgba,
  colorFormats.oklch,
];

/** The colour primitive's defaults. */
export const defaultColorConfig: ColorConfig = {
  output: defaultFormatPriority,
  strictness: 'auto',
  transparent: 'keyword',
  omitOpaqueAlpha: false,
};

/* ============================================================================
 * FACTORY: createColor({ formats }) — extend the pipeline at the INPUT and OUTPUT
 * edges with custom format plugins, while storage stays canonical OKLCH.
 *
 * The instance binds a per-instance registry (`{ ...colorFormats, ...plugins }`) and a
 * plugin-aware input parser. Built-in parse precedence is intact: a plugin only claims
 * strings the built-ins reject. The module-level `color` is `createColor({ formats: [] })`
 * at defaults (the "default = factory at defaults" pattern), so its behaviour is
 * identical to a bare factory instance with no plugins.
 * ==========================================================================*/

/** The format-literal union carried by a plugins tuple (`'zoo' | ...`). */
type PluginFormat<P extends ReadonlyArray<ColorFormatPlugin>> =
  P[number]['format'];

/**
 * A `ResolvedColor` augmented with one typed, lazy named selector per registered
 * plugin format (e.g. `.zoo`): each returns this colour reconfigured to render through
 * that plugin's descriptor, then finished via `.css()`. Typed from the passed formats
 * tuple, not `any`.
 */
type CustomResolvedColor<P extends ReadonlyArray<ColorFormatPlugin>> =
  ResolvedColor & {
    readonly [K in PluginFormat<P>]: ResolvedColor<K>;
  };

/** A factory-bound `color()`: same call shape, plus the per-instance registry. */
export interface CustomColor<
  P extends ReadonlyArray<ColorFormatPlugin>,
> {
  (
    input: ColorInput,
    config?: Partial<ColorConfig>,
  ): CustomResolvedColor<P>;
  /**
   * The per-instance format registry (built-ins + plugins), keyed by format name. A
   * future gilding/fallback seam reads each descriptor's fidelity / browser bits from
   * here.
   */
  readonly formats: Readonly<
    Record<string, ColorSpaceDescriptor<string>>
  >;
}

/** The config a custom colour instance is built from. */
export interface CreateColorConfig<
  P extends ReadonlyArray<ColorFormatPlugin>,
> {
  /** the custom format plugins to register at the input + output edges. */
  formats: P;
}

/**
 * Build a `color()`-shaped function bound to the given custom format plugins. The
 * instance parser tries the built-in parse first, then each plugin's `parse` in order;
 * the plugins are valid `output` descriptors and resolve through `asDescriptor`. The
 * returned result exposes a typed lazy selector per plugin format.
 */
export const createColor = <
  const P extends ReadonlyArray<ColorFormatPlugin>,
>(
  config: CreateColorConfig<P>,
): CustomColor<P> => {
  const plugins = config.formats;
  // the per-instance registry: built-ins, then plugins (a plugin may shadow a built-in
  // name; built-in parse precedence is unaffected, it is consulted before plugins).
  const registry: Record<string, ColorSpaceDescriptor<string>> = {
    ...colorFormats,
  };
  for (const plugin of plugins) {
    registry[plugin.format] = plugin;
  }

  // the plugin-aware parser threaded through every parse this instance does.
  const instanceParse = (input: ColorInput | Color): Store =>
    parseInput(input, plugins);
  const binding: ResolveBinding = { parse: instanceParse, plugins };

  const instance = (
    input: ColorInput,
    callConfig?: Partial<ColorConfig>,
  ): CustomResolvedColor<P> =>
    resolveWith(
      storeColor(instanceParse(input)),
      callConfig === undefined
        ? defaultColorConfig
        : { ...defaultColorConfig, ...callConfig },
      binding,
    ) as CustomResolvedColor<P>;

  return Object.assign(instance, { formats: registry });
};

/**
 * `color(input, config?)`: the native colour input, alongside `m()`, `r()`, `i()`,
 * `f()`. Parses + normalizes `input` to OKLCH and resolves it with the default
 * config (override per call via `config`). Mirrors how `m()` wraps a measurement.
 *
 * It is `createColor({ formats: [] })` at defaults: the module-level instance is just
 * the factory with no custom plugins, so the default and the factory share one
 * construction path. Typed as the bare `(input, config?) => ResolvedColor` surface.
 */
export const color: (
  input: ColorInput,
  config?: Partial<ColorConfig>,
) => ResolvedColor = createColor({ formats: [] });
