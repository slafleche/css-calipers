import { describe, expect, it, vi } from 'vitest';

import {
  color,
  colorFormats,
  type ColorInput,
  defaultColorConfig,
  parseColor,
  resolve as resolveColor,
} from '../../../src/color';

/*
 * Targeted branch coverage for the colour engine paths the matrix / modify suites do
 * not reach: the unsupported-input throw, the mix-with-a-symbolic-target violation,
 * the public `resolveColor` free function, the no-format-fits escalation fallback, and
 * the out-of-gamut / strictness branches in the format internals. Outputs are asserted
 * against the real behaviour observed by running, not hand-derived.
 */

describe('color — unsupported input', () => {
  it('throws when the input is not a string, colour object, or culori colour', () => {
    // parseColor falls through every recognized shape and throws.
    expect(() => parseColor(42 as unknown as ColorInput)).toThrow(
      'color: unsupported color input',
    );
    expect(() => parseColor(true as unknown as ColorInput)).toThrow(
      'color: unsupported color input',
    );
  });
});

describe('color — mixing with a symbolic target', () => {
  it('violates (throws in dev) when the mix target is a symbolic keyword', () => {
    // base is translatable, but the TARGET is symbolic -> targetColor() violates.
    expect(() => color('#3366cc').mix('currentColor')).toThrow(
      /cannot mix with a symbolic color/,
    );
    expect(() => color('#3366cc').mixSolid('inherit')).toThrow(
      /cannot mix with a symbolic color/,
    );
  });

  it('warns instead of throwing when strictness is "warn"', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    // strictness 'warn' surfaces the violation as a console.warn, not a throw.
    expect(() =>
      color('#3366cc', { strictness: 'warn' }).mix('currentColor'),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/cannot mix with a symbolic color/),
    );
    warn.mockRestore();
  });

  it('under silent strictness, an unmixable op returns the colour unchanged (no-op)', () => {
    // strictness 'silent' makes violate a no-op, so blend / modifiable return
    // undefined and the modifier falls back to `self()` (the colour as-is). This
    // exercises the `=== undefined ? self()` branches of mixSolid / mixWithAlpha /
    // solid for both a symbolic TARGET and a symbolic BASE.
    const silent = (input: ColorInput) =>
      color(input, { strictness: 'silent' });

    // symbolic target -> blend undefined -> mixSolid returns the base unchanged.
    expect(
      silent('#3366cc').mixSolid('currentColor').hex().css(),
    ).toBe('#3366cc');
    // symbolic target -> mixWithAlpha returns the base unchanged.
    expect(
      silent('#3366cc').mixWithAlpha('inherit', 0.5, 0.3).hex().css(),
    ).toBe('#3366cc');
    // symbolic BASE -> modifiable undefined -> mixWithAlpha returns self() (the keyword).
    expect(silent('currentColor').mixWithAlpha('#fff').css()).toBe(
      'currentColor',
    );
    // symbolic BASE -> solid() returns self() (the keyword passes through).
    expect(silent('inherit').solid().css()).toBe('inherit');
  });
});

describe('color — public resolveColor free function', () => {
  it('resolves a store + config through the built-in binding', () => {
    // resolveColor is the instance-agnostic resolver (no plugins); it must render
    // the same css as the bound default instance.
    const store = parseColor('#3366cc');
    const resolved = resolveColor(store, defaultColorConfig);
    expect(resolved.css()).toBe(color('#3366cc').css());
    expect(resolved.hex().css()).toBe('#3366cc');
  });
});

describe('color — escalation fallback (no format fits)', () => {
  it('falls back to the LAST entry when no listed format faithfully holds the colour', () => {
    // a list of only sRGB, no-alpha formats cannot hold a wide-gamut oklch colour,
    // so chooseFormat returns the last entry (rgb), which then clamps to fit.
    const out = color('oklch(0.7 0.37 150)', {
      output: [
        colorFormats.hex,
        colorFormats.rgb,
      ],
      // silence the clamp violation so we observe the format choice, not a throw.
      strictness: 'silent',
    }).css();
    // the last entry (rgb) won by fallback, not by fit.
    expect(out).toMatch(/^rgb\(/);
  });
});

describe('color — asDescriptor name-vs-object resolution', () => {
  it('resolves a BARE format selector by registry name (no render field)', () => {
    // `{ format: 'hex' }` carries no `render`, so asDescriptor must look it up by
    // name in the built-in registry (the false branch).
    expect(
      color('#3366cc', { output: { format: 'hex' } }).css(),
    ).toBe('#3366cc');
    expect(
      color('#3366cc80', { output: { format: 'rgba' } }).css(),
    ).toBe('rgba(51, 102, 204, 0.502)');
  });

  it('resolves a FULL descriptor object directly (it carries render)', () => {
    // colorFormats.hex IS a descriptor with a `render`, so asDescriptor uses it
    // as-is (the true branch), no registry lookup.
    expect(color('#3366cc', { output: colorFormats.hex }).css()).toBe(
      '#3366cc',
    );
  });
});

describe('color — out-of-gamut hardening (fitGamut violate)', () => {
  it('throws in dev when rendering an out-of-sRGB colour as hex (auto strictness)', () => {
    // a high-chroma oklch colour is outside sRGB; rendering it as hex must surface
    // the out-of-gamut violation (default 'auto' -> throw in dev).
    expect(() => color('oklch(0.7 0.37 150)').hex().css()).toThrow(
      /out of sRGB gamut/,
    );
  });

  it('warns (not throws) for out-of-gamut under strictness "warn"', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const out = color('oklch(0.7 0.37 150)', { strictness: 'warn' })
      .hex()
      .css();
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/out of sRGB gamut/),
    );
    // chroma was clamped to fit, so a valid hex still comes out.
    expect(out).toMatch(/^#[0-9a-f]{6}$/);
    warn.mockRestore();
  });

  it('does not violate when the colour is already in gamut', () => {
    // an in-sRGB colour passes fitGamut's `within` check, skipping the violate.
    expect(color('#3366cc').hex().css()).toBe('#3366cc');
  });

  it('names display-p3 in the violation when rendering out-of-P3 as displayP3', () => {
    // oklch(0.7 0.37 150) is beyond P3, so the display-p3 render path hits fitGamut
    // with gamut 'p3' -> the "out of display-p3 gamut" branch of the message.
    expect(() =>
      color('oklch(0.7 0.37 150)').displayP3().css(),
    ).toThrow(/out of display-p3 gamut/);
  });

  it('warns instead of throwing under "auto" when NODE_ENV is production', () => {
    // 'auto' resolves to throw in dev / warn in prod. Forcing production exercises the
    // prod ("warn") side of the strictness ternary in `violate`.
    const proc = (
      globalThis as { process?: { env?: { NODE_ENV?: string } } }
    ).process;
    const previous = proc?.env?.NODE_ENV;
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    if (proc?.env) proc.env.NODE_ENV = 'production';
    try {
      // auto + production -> warn, not throw.
      expect(() =>
        color('oklch(0.7 0.37 150)').hex().css(),
      ).not.toThrow();
      expect(warn).toHaveBeenCalledWith(
        expect.stringMatching(/out of sRGB gamut/),
      );
    } finally {
      if (proc?.env) proc.env.NODE_ENV = previous;
      warn.mockRestore();
    }
  });
});
