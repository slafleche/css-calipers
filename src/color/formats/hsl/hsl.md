# hsl

sRGB with alpha, higher precision than 8-bit: `hsl(h s% l% / a)`.

## Render

From the OKLCH store: gamut-map into sRGB, then `hsl(h s% l% / a)` (hue normalized
to `[0, 360)`, slot per `omitOpaqueAlpha`). Out-of-sRGB is clamped
(strictness-governed).

## Browser & fidelity

- Universal: no `@supports` probe, not gamut-dependent.
- A safe **sRGB floor** (`srgbFloor: true`); higher precision than `rgb`/`hex`.
- alpha: yes · gamut: sRGB · precision: ~2dp.

See `../README.md` and `../../color-fallback-research.md`.
