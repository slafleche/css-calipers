# lab

CIELAB, unbounded gamut, float precision: `lab(l a b / a)`.

## Render

From the OKLCH store: convert to CIELAB, then `lab(l a b / a)` (no gamut clamp; lab
holds any color). Slot per `omitOpaqueAlpha`.

## Browser & fidelity

- Syntax-level (~93–95% support): `@supports` probe `(color: lab(0 0 0))`. The
  browser gamut-maps to the display, so **not** gamut-dependent.
- Not a floor.
- alpha: yes · gamut: unbounded · precision: float 3dp.

See `../README.md` and `../../color-fallback-research.md`.
