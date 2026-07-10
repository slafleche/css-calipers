# hexAlpha

sRGB with alpha, 8-bit: `#rrggbbaa`. The alpha counterpart of `hex`.

## Render

From the OKLCH store: gamut-map into sRGB, then `#rrggbbaa` (always carries the
alpha byte). Out-of-sRGB is clamped (strictness-governed).

## Browser & fidelity

- Universal: no `@supports` probe, not gamut-dependent.
- A safe **sRGB floor** (`srgbFloor: true`).
- alpha: yes · gamut: sRGB · precision: 8-bit.

See `../README.md` and `../../color-fallback-research.md`.
