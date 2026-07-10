import { describe, expect, it } from 'vitest';

import { color } from '../../../src/color';

/*
 * GOAL C: fully-transparent (alpha 0) rendering policy. The default ladder is
 * `[hex, rgba, oklch]`, so an alpha-0 color escalates past no-alpha `hex` to the
 * `rgba` slot. Under that slot:
 *   - `transparent: 'keyword'` (the default) emits the `transparent` keyword.
 *   - `transparent: 'white' | 'black'` emits the substitute colour at alpha 0,
 *     which sidesteps the old-Safari gradient quirk (see formats/README.md).
 *
 * `.alpha(0)` threads through the OKLCH store: it sets the stored alpha to 0, and the
 * render step reads `alphaOf(color) === 0` to apply the policy.
 */

describe('transparent rendering — alpha(0) policy', () => {
  it("default config -> 'transparent' keyword", () => {
    expect(color('#3366cc').alpha(0).css()).toBe('transparent');
  });

  it("{ transparent: 'white' } -> white at alpha 0 under the rgba slot", () => {
    expect(
      color('#3366cc', { transparent: 'white' }).alpha(0).css(),
    ).toBe('rgba(255, 255, 255, 0)');
  });

  it("{ transparent: 'black' } -> black at alpha 0 under the rgba slot", () => {
    expect(
      color('#3366cc', { transparent: 'black' }).alpha(0).css(),
    ).toBe('rgba(0, 0, 0, 0)');
  });

  it('alpha(0) genuinely yields alpha 0 (the read-back getter agrees)', () => {
    expect(color('#3366cc').alpha(0).alpha()).toBe(0);
  });
});

describe('transparent rendering — .transparentAs(mode) per-render override', () => {
  it('overrides the config default for this render', () => {
    // config default is 'keyword'; the method forces white at alpha 0.
    expect(
      color('#3366cc').alpha(0).transparentAs('white').css(),
    ).toBe('rgba(255, 255, 255, 0)');
  });

  it('wins over a configured transparent value (most-specific wins)', () => {
    expect(
      color('#3366cc', { transparent: 'white' })
        .alpha(0)
        .transparentAs('keyword')
        .css(),
    ).toBe('transparent');
  });

  it('applies across every alpha-capable format, not just rgba', () => {
    const t = color('#3366cc').alpha(0);
    expect(t.rgba().transparentAs('white').css()).toBe(
      'rgba(255, 255, 255, 0)',
    );
    expect(t.hexAlpha().transparentAs('white').css()).toBe(
      '#ffffff00',
    );
    // hsl / oklch render white at alpha 0 in their own syntax (alpha slot 0).
    expect(t.hsl().transparentAs('white').css()).toMatch(
      /^hsl\(.* \/ 0\)$/,
    );
    expect(t.oklch().transparentAs('white').css()).toMatch(
      /^oklch\(.* \/ 0\)$/,
    );
  });

  it("'preserve' keeps the colour's own RGB at alpha 0 (truest fade)", () => {
    expect(
      color('#3366cc')
        .alpha(0)
        .transparentAs('preserve')
        .rgba()
        .css(),
    ).toBe('rgba(51, 102, 204, 0)');
  });

  it('is a no-op when the colour is not fully transparent', () => {
    // opaque: the policy never fires, so the solid renders normally.
    expect(color('#3366cc').transparentAs('white').css()).toBe(
      '#3366cc',
    );
    // partial alpha is not alpha 0, so the override is also inert.
    expect(
      color('#3366cc').alpha(0.5).transparentAs('white').css(),
    ).toBe('rgba(51, 102, 204, 0.5)');
  });
});

/*
 * #36 transparency policy sweep across ALL alpha-capable formats. The existing
 * "applies across every alpha-capable format" case only sweeps 'white'; 'preserve' was
 * checked rgba-only. Here 'preserve', 'keyword', and 'black' are each swept across
 * rgba / hexAlpha / hsl / oklch.
 *
 * Note on 'keyword': renderColor short-circuits to the bare `transparent` keyword
 * BEFORE serialising (index.ts), so the format selector is irrelevant — every format
 * yields the literal string 'transparent'.
 */
describe('transparent rendering — policy sweep across alpha-capable formats', () => {
  const t = color('#3366cc').alpha(0);

  it("'keyword' emits the bare `transparent` keyword for every format", () => {
    expect(t.rgba().transparentAs('keyword').css()).toBe(
      'transparent',
    );
    expect(t.hexAlpha().transparentAs('keyword').css()).toBe(
      'transparent',
    );
    expect(t.hsl().transparentAs('keyword').css()).toBe(
      'transparent',
    );
    expect(t.oklch().transparentAs('keyword').css()).toBe(
      'transparent',
    );
  });

  it("'black' renders black at alpha 0 in each format's own syntax", () => {
    expect(t.rgba().transparentAs('black').css()).toBe(
      'rgba(0, 0, 0, 0)',
    );
    expect(t.hexAlpha().transparentAs('black').css()).toBe(
      '#00000000',
    );
    expect(t.hsl().transparentAs('black').css()).toBe(
      'hsl(0 0% 0% / 0)',
    );
    expect(t.oklch().transparentAs('black').css()).toMatch(
      /^oklch\(.* \/ 0\)$/,
    );
  });

  it("'preserve' keeps the colour's own value at alpha 0 in each format", () => {
    expect(t.rgba().transparentAs('preserve').css()).toBe(
      'rgba(51, 102, 204, 0)',
    );
    expect(t.hexAlpha().transparentAs('preserve').css()).toBe(
      '#3366cc00',
    );
    // hsl / oklch keep the colour's own hue/sat/light at alpha slot 0 (not 0 0% 0%).
    expect(t.hsl().transparentAs('preserve').css()).toMatch(
      /^hsl\(.* \/ 0\)$/,
    );
    expect(t.oklch().transparentAs('preserve').css()).toMatch(
      /^oklch\(.* \/ 0\)$/,
    );
  });
});
