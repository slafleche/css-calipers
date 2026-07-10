# display-p3

Wider-than-sRGB device RGB (the P3 gamut), with alpha:
`color(display-p3 r g b / a)`.

## Render

From the OKLCH store: gamut-map into P3, then `color(display-p3 r g b / a)`
(channels 0–1, 5dp). Out-of-P3 is clamped (strictness-governed).

## Browser & fidelity

- The one **gamut-dependent** format: a fallback should gate on both
  `@supports (color: color(display-p3 0 0 0))` AND `@media (color-gamut: p3)`, since
  the wider color only shows on a P3 display.
- Not a floor.
- alpha: yes · gamut: P3 · precision: float 5dp.

See `../README.md` and `../../color-fallback-research.md`.
