import { describe, expect, it } from 'vitest';

import {
  color,
  type ColorInput,
  defaultColorConfig,
  parseColor,
  storeColor,
} from '../../../src/color';
import { displayP3 } from '../../../src/color/formats/display-p3/display-p3';
import { hex } from '../../../src/color/formats/hex/hex';
import { hexAlpha } from '../../../src/color/formats/hexAlpha/hexAlpha';
import { hsl } from '../../../src/color/formats/hsl/hsl';
import { hwb } from '../../../src/color/formats/hwb/hwb';
import { lab } from '../../../src/color/formats/lab/lab';
import { lch } from '../../../src/color/formats/lch/lch';
import { oklab } from '../../../src/color/formats/oklab/oklab';
import { rgb } from '../../../src/color/formats/rgb/rgb';
import { rgba } from '../../../src/color/formats/rgba/rgba';
import type {
  ColorSpaceDescriptor,
  Gamut,
} from '../../../src/color/formats/types';

/**
 * Per-format descriptor coverage: each descriptor's `render` must match the book's
 * own selector output (parity, so extracting render can't drift from `serialize`),
 * and its fidelity + browser metadata must be correct. The book's output VALUES are
 * covered in `color.output.src.test.ts`; here we pin the descriptors. `oklch` has its
 * own file (`formats.oklch.src.test.ts`). `#3366cc` is opaque and in sRGB, so every
 * format holds it without a violation.
 */

type Resolved = ReturnType<typeof color>;
const OPAQUE = '#3366cc';

const stored = (input: ColorInput) => {
  const s = storeColor(parseColor(input));
  if (s.kind !== 'color')
    throw new Error('expected a translatable color');
  return s.color;
};

interface Case {
  d: ColorSpaceDescriptor;
  sel: (c: Resolved) => Resolved;
  hasAlpha: boolean;
  gamut: Gamut;
  supportsProbe: string | null;
  gamutDependent: boolean;
  srgbFloor: boolean;
}

const CASES: Case[] = [
  // sRGB 8-bit family
  {
    d: rgb,
    sel: (c) => c.rgb(),
    hasAlpha: false,
    gamut: 'srgb',
    supportsProbe: null,
    gamutDependent: false,
    srgbFloor: true,
  },
  {
    d: rgba,
    sel: (c) => c.rgba(),
    hasAlpha: true,
    gamut: 'srgb',
    supportsProbe: null,
    gamutDependent: false,
    srgbFloor: true,
  },
  {
    d: hex,
    sel: (c) => c.hex(),
    hasAlpha: false,
    gamut: 'srgb',
    supportsProbe: null,
    gamutDependent: false,
    srgbFloor: true,
  },
  {
    d: hexAlpha,
    sel: (c) => c.hexAlpha(),
    hasAlpha: true,
    gamut: 'srgb',
    supportsProbe: null,
    gamutDependent: false,
    srgbFloor: true,
  },
  // higher-precision sRGB
  {
    d: hsl,
    sel: (c) => c.hsl(),
    hasAlpha: true,
    gamut: 'srgb',
    supportsProbe: null,
    gamutDependent: false,
    srgbFloor: true,
  },
  {
    d: hwb,
    sel: (c) => c.hwb(),
    hasAlpha: true,
    gamut: 'srgb',
    supportsProbe: '(color: hwb(0 0% 0%))',
    gamutDependent: false,
    srgbFloor: false,
  },
  // P3 gamut (gamut-dependent)
  {
    d: displayP3,
    sel: (c) => c.displayP3(),
    hasAlpha: true,
    gamut: 'p3',
    supportsProbe: '(color: color(display-p3 0 0 0))',
    gamutDependent: true,
    srgbFloor: false,
  },
  // unbounded float spaces
  {
    d: lab,
    sel: (c) => c.lab(),
    hasAlpha: true,
    gamut: 'unbounded',
    supportsProbe: '(color: lab(0 0 0))',
    gamutDependent: false,
    srgbFloor: false,
  },
  {
    d: lch,
    sel: (c) => c.lch(),
    hasAlpha: true,
    gamut: 'unbounded',
    supportsProbe: '(color: lch(0 0 0))',
    gamutDependent: false,
    srgbFloor: false,
  },
  {
    d: oklab,
    sel: (c) => c.oklab(),
    hasAlpha: true,
    gamut: 'unbounded',
    supportsProbe: '(color: oklab(0 0 0))',
    gamutDependent: false,
    srgbFloor: false,
  },
];

describe('format descriptors — render parity + metadata', () => {
  for (const k of CASES) {
    it(`${k.d.format} render matches the book`, () => {
      expect(k.d.render(stored(OPAQUE), defaultColorConfig)).toBe(
        k.sel(color(OPAQUE)).css(),
      );
    });
    it(`${k.d.format} metadata`, () => {
      expect({
        hasAlpha: k.d.hasAlpha,
        gamut: k.d.gamut,
        supportsProbe: k.d.supportsProbe,
        gamutDependent: k.d.gamutDependent,
        srgbFloor: k.d.srgbFloor,
      }).toEqual({
        hasAlpha: k.hasAlpha,
        gamut: k.gamut,
        supportsProbe: k.supportsProbe,
        gamutDependent: k.gamutDependent,
        srgbFloor: k.srgbFloor,
      });
    });
  }
});
