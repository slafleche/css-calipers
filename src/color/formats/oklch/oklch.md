# oklch

The perceptual modern default (CSS Color 4). Cylindrical form of OKLab:
`oklch(<lightness> <chroma> <hue> / <alpha>)`.

## Render

From the canonical OKLCH store this is a direct read: `oklch(l c h / alpha)`, with
`l`/`c` at 4dp and `h` normalized to `[0, 360)`. The alpha slot follows the book's
`omitOpaqueAlpha` config (dropped only when the color is opaque and that flag is on).

## Browser support / detection

- Syntax support is wide (~93 to 95 percent in 2026). It is the modern default.
- **Detection**: `@supports (color: oklch(0 0 0))`. This is the descriptor's
  `supportsProbe`.
- **Gamut**: not display-gamut dependent. The browser gamut-maps an out-of-display
  color, so no `@media (color-gamut)` gate is needed (`gamutDependent: false`).

## Fallbacks

`oklch` is not a safe floor (`srgbFloor: false`), so in a fallback chain it sits
above an sRGB floor (e.g. `rgb`). A color authored in `oklch` falls back to the next
lower format in the configured priority chain, down to the floor, which is computed
losslessly from the OKLCH store via culori gamut mapping.

See `../../color-fallback-research.md` for how the cascade / `@supports` layouts are
built from these descriptors.
