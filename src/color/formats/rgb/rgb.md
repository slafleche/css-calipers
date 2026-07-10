# rgb

sRGB, no alpha, 8-bit: `rgb(r, g, b)` with channels 0–255.

## Render

From the OKLCH store: gamut-map into sRGB, then `rgb(r, g, b)` (8-bit, lossy). A
real alpha can't be held (violation; use `rgba`); out-of-sRGB is clamped
(strictness-governed).

## Browser & fidelity

- Universal: no `@supports` probe, not gamut-dependent.
- The safe **sRGB floor** (`srgbFloor: true`); the fallback chain stops here.
- alpha: no · gamut: sRGB · precision: 8-bit.

See `../README.md` and `../../color-fallback-research.md`.
