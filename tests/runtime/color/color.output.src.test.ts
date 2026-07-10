import { afterEach, describe, expect, it, vi } from 'vitest';

import { color, colorFormats } from '../../../src/color';

/*
 * OUTPUT step (Part 3): formats + `.css()`. Default is rgba with the alpha slot always
 * shown; alpha-capable formats always render the slot; `rgb`/`hex` carry no alpha and
 * dropping a real alpha is a strictness-governed violation; out-of-gamut on a narrow
 * format is likewise a violation. Real assertions (no `it.todo`).
 */

describe('color output — default escalates to the simplest faithful format', () => {
  it('opaque, in sRGB -> hex', () => {
    expect(color('#3366cc').css()).toBe('#3366cc');
  });

  it('with alpha -> rgba (escalates past no-alpha hex)', () => {
    expect(color('#3366cc80').css()).toBe(
      'rgba(51, 102, 204, 0.502)',
    );
  });
});

describe('color output — every alpha-capable format always renders its slot', () => {
  it('oklch shows / 1 when opaque', () => {
    expect(color('#3366cc').oklch().css()).toMatch(
      /^oklch\(.+ \/ 1\)$/,
    );
  });

  it('hsl shows / 1 when opaque', () => {
    expect(color('#3366cc').hsl().css()).toMatch(/^hsl\(.+ \/ 1\)$/);
  });

  it('hexAlpha carries the alpha byte', () => {
    expect(color('#3366cc').hexAlpha().css()).toBe('#3366ccff');
  });
});

describe('color output — selectors and named format selectors', () => {
  it('a named selector renders that format', () => {
    expect(color('#3366cc').hex().css()).toBe('#3366cc');
  });

  it('selector then .css() is equivalent', () => {
    expect(color('#3366cc').hex().css()).toBe('#3366cc');
  });

  it('displayP3 renders the color() function', () => {
    expect(color('#3366cc').displayP3().css()).toMatch(
      /^color\(display-p3 .+ \/ 1\)$/,
    );
  });
});

describe('color output — config binds the default format', () => {
  it('per-call config overrides the default output', () => {
    expect(color('#3366cc', { output: colorFormats.hex }).css()).toBe(
      '#3366cc',
    );
  });
});

describe('color output — never silently drop alpha', () => {
  it("rgb on a transparent color throws in dev (strictness 'auto')", () => {
    expect(() => color('#3366cc80').rgb().css()).toThrow();
  });

  it("hex on a transparent color throws in dev (strictness 'auto')", () => {
    expect(() => color('#3366cc80').hex().css()).toThrow();
  });

  it("strictness 'silent' drops the alpha without complaint", () => {
    expect(
      color('#3366cc80', { strictness: 'silent' }).rgb().css(),
    ).toBe('rgb(51, 102, 204)');
  });

  it('opaque color into rgb is fine (no alpha to drop)', () => {
    expect(color('#3366cc').rgb().css()).toBe('rgb(51, 102, 204)');
  });
});

describe('color output — out-of-gamut is a strictness-governed violation', () => {
  const wide = 'oklch(0.7 0.37 150)'; // far outside sRGB

  it('throws in dev when rendered to a narrow (sRGB) format', () => {
    expect(() => color(wide).rgb().css()).toThrow();
  });

  it("strictness 'silent' clamps to a valid in-gamut value", () => {
    expect(color(wide, { strictness: 'silent' }).rgb().css()).toMatch(
      /^rgb\(\d+, \d+, \d+\)$/,
    );
  });

  it('wide-gamut formats (oklch) keep it without complaint', () => {
    expect(color(wide).oklch().css()).toMatch(/^oklch\(.+ \/ 1\)$/);
  });
});

/*
 * #33 omitOpaqueAlpha: when set, an OPAQUE colour drops the optional alpha slot for
 * formats whose alpha is optional (rgba collapses to `rgb(...)`, oklch loses its
 * ` / 1`). A TRANSLUCENT colour keeps its alpha regardless. Lossless. Logic lives in
 * internals.ts `alphaSlot` (the slot) and the rgba descriptor (the `rgb(...)` collapse).
 */
describe('color output — omitOpaqueAlpha drops the alpha slot on opaque colours', () => {
  it('opaque rgba collapses to rgb(...) (no alpha to keep)', () => {
    expect(
      color('#3366cc', { omitOpaqueAlpha: true }).rgba().css(),
    ).toBe('rgb(51, 102, 204)');
  });

  it('opaque oklch loses its " / 1" slot', () => {
    const css = color('#3366cc', { omitOpaqueAlpha: true })
      .oklch()
      .css();
    expect(css).not.toContain('/');
    expect(css).toMatch(/^oklch\([^/]+\)$/);
  });

  it('a translucent colour still shows its alpha (slot is not dropped)', () => {
    expect(
      color('#3366cc80', { omitOpaqueAlpha: true }).rgba().css(),
    ).toBe('rgba(51, 102, 204, 0.502)');
  });

  it('a translucent oklch keeps its alpha slot', () => {
    expect(
      color('#3366cc80', { omitOpaqueAlpha: true }).oklch().css(),
    ).toMatch(/^oklch\(.+ \/ 0\.502\)$/);
  });

  it('a modification (darken) then render with omitOpaqueAlpha still drops the opaque slot', () => {
    // darken keeps the colour opaque, so the rgb(...) collapse still applies.
    expect(
      color('#3366cc', { omitOpaqueAlpha: true })
        .darken(0.2)
        .rgba()
        .css(),
    ).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });

  it('opaque rgba keeps the alpha slot when omitOpaqueAlpha is off (default)', () => {
    expect(color('#3366cc').rgba().css()).toBe(
      'rgba(51, 102, 204, 1)',
    );
  });
});

/*
 * #34 strictness 'warn' and explicit 'throw' on an alpha-dropping render. `warn` logs
 * a console.warn and STILL renders (does not throw); `throw` throws regardless of env.
 * See internals.ts `violate` (lines 21-33): the explicit modes bypass the auto
 * dev/prod branch entirely.
 */
describe("color output — strictness 'warn' renders with a warning", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warn: alpha-dropping rgb of a translucent colour logs a warning and still renders', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const css = color('#3366cc80', { strictness: 'warn' })
      .rgb()
      .css();
    expect(css).toBe('rgb(51, 102, 204)');
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('warn: does not throw', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() =>
      color('#3366cc80', { strictness: 'warn' }).rgb().css(),
    ).not.toThrow();
  });
});

describe("color output — strictness 'throw' throws regardless of env", () => {
  it('throw: alpha-dropping rgb of a translucent colour throws', () => {
    expect(() =>
      color('#3366cc80', { strictness: 'throw' }).rgb().css(),
    ).toThrow();
  });

  it('throw: alpha-dropping hex of a translucent colour throws', () => {
    expect(() =>
      color('#3366cc80', { strictness: 'throw' }).hex().css(),
    ).toThrow();
  });
});
