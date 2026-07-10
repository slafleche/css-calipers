import { describe, expect, it } from 'vitest';

import { color } from '../../../src/color';

/*
 * The SPECIAL (symbolic) color words: keywords with no fixed value. Separate suite
 * from the make x emit matrix because they pass through - a symbolic color emits its
 * own keyword no matter which output format is requested.
 *
 * Passthrough is implemented. Modification of a symbolic color is the NEXT step, so
 * those stay real failing placeholders (never `it.todo`).
 */
const SYMBOLIC = [
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
];

// Passthrough: a symbolic color emits its own keyword no matter which output
// format is requested. e.g. `Highlight` -> 'Highlight' for css/hex/oklch/anything.
describe('color — symbolic keywords pass through for any format', () => {
  for (const keyword of SYMBOLIC) {
    it(`${keyword} emits "${keyword}" regardless of format`, () => {
      expect(color(keyword).css()).toBe(keyword);
      expect(color(keyword).hex().css()).toBe(keyword);
      expect(color(keyword).hexAlpha().css()).toBe(keyword);
      expect(color(keyword).oklch().css()).toBe(keyword);
      expect(color(keyword).displayP3().css()).toBe(keyword);
    });
  }
});

// A symbolic color has no fixed value, so modifying it is a violation (throws in dev
// under the default 'auto' strictness).
describe('color — symbolic keywords reject modification', () => {
  for (const keyword of SYMBOLIC) {
    it(`${keyword} modification throws`, () => {
      expect(() => color(keyword).darken()).toThrow();
    });
  }
});
