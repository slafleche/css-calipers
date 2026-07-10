# lch

CIELCH (cylindrical CIELAB), unbounded gamut, float precision: `lch(l c h / a)`.

## Render

From the OKLCH store: convert to CIELCH, then `lch(l c h / a)` (hue normalized; no
gamut clamp). Slot per `omitOpaqueAlpha`.

## Browser & fidelity

- Syntax-level: `@supports` probe `(color: lch(0 0 0))`. Not gamut-dependent.
- Not a floor.
- alpha: yes · gamut: unbounded · precision: float 3dp.

See `../README.md` and `../../color-fallback-research.md`.
