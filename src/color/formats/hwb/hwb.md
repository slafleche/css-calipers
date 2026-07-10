# hwb

sRGB with alpha, higher precision: `hwb(h w% b% / a)`.

## Render

From the OKLCH store: gamut-map into sRGB, then `hwb(h w% b% / a)`. Out-of-sRGB is
clamped (strictness-governed).

## Browser & fidelity

- Newer than `hsl`/`rgb` (~96% support), so it carries an `@supports` probe
  (`(color: hwb(0 0% 0%))`) and is **not** treated as the safe floor.
- Not gamut-dependent.
- alpha: yes · gamut: sRGB · precision: ~2dp.

See `../README.md` and `../../color-fallback-research.md`.
