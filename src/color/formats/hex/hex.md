# hex

sRGB, no alpha, 8-bit: `#rrggbb`. The most compact universal form.

## Render

From the OKLCH store: gamut-map into sRGB, then `#rrggbb`. A real alpha can't be
held (violation; use `hexAlpha`); out-of-sRGB is clamped (strictness-governed).

## Browser & fidelity

- Universal: no `@supports` probe, not gamut-dependent.
- The safe **sRGB floor** (`srgbFloor: true`); the default chain's simplest entry.
- alpha: no · gamut: sRGB · precision: 8-bit.

See `../README.md` and `../../color-fallback-research.md`.
