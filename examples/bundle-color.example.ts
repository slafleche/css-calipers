/**
 * Example-only file. Not part of the public API surface and not published.
 *
 * The corpus BUNDLE (`createCalipersBundle`) binds every Layer-1 lexicon at once,
 * colour included, under one keyed config with the cascade. The `color` slot is
 * forwarded to `createColor`, so a custom format registered on the bundle reaches
 * the bound `color` helper: you configure the whole layer in one place and pull
 * `m` / `i` / `f` / `color` off a single instance.
 */
import {
  type ColorFormatPlugin,
  type ColorString,
  createCalipersBundle,
} from '@css-bookends/css-calipers';

// A tiny custom format that renders any colour as a fixed design token. (Illustrative
// only; see custom-format.example.ts for a real parse + render plugin.)
const token: ColorFormatPlugin<'token'> = {
  format: 'token',
  hasAlpha: true,
  gamut: 'unbounded',
  supportsProbe: null,
  gamutDependent: false,
  srgbFloor: false,
  render: (): ColorString<'token'> =>
    'var(--brand)' as ColorString<'token'>,
};

const cx = createCalipersBundle({
  color: {
    formats: [
      token,
    ],
  },
});

// the measurement / scalar lexicons come off the same configured bundle...
export const gap = cx.m(8).css(); // '8px'
export const grow = cx.i(2).css(); // '2'

// ...and so does a colour that already knows the forwarded custom format.
export const brandHex = cx.color('#3366cc').hex().css(); // '#3366cc'
export const brandToken = cx.color('#3366cc').token.css(); // 'var(--brand)'
export const tokenRegistered = cx.color.formats.token === token; // true
