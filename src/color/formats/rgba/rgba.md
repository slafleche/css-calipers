# rgba

sRGB with alpha, 8-bit: `rgba(r, g, b, a)`.

## Render

From the OKLCH store: gamut-map into sRGB, then `rgba(r, g, b, a)`. When the color
is opaque and `omitOpaqueAlpha` is set it collapses to `rgb(...)` (lossless).
Out-of-sRGB is clamped (strictness-governed).

## Browser & fidelity

- Universal: no `@supports` probe, not gamut-dependent.
- A safe **sRGB floor** (`srgbFloor: true`).
- alpha: yes · gamut: sRGB · precision: 8-bit.

See `../README.md` and `../../color-fallback-research.md`.
