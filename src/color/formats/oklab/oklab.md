# oklab

OKLab (rectangular), unbounded gamut, float precision: `oklab(l a b / a)`.

## Render

From the OKLCH store: convert to OKLab, then `oklab(l a b / a)` (no gamut clamp).
Perceptual, like `oklch` but in a/b coordinates. Slot per `omitOpaqueAlpha`.

## Browser & fidelity

- Syntax-level: `@supports` probe `(color: oklab(0 0 0))`. Not gamut-dependent.
- Not a floor.
- alpha: yes · gamut: unbounded · precision: float 4dp.

See `../README.md` and `../../color-fallback-research.md`.
