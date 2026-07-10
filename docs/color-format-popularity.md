# CSS colour format popularity (research)

Purpose: ground the default `defaultFormatPriority` order in `src/color/index.ts`
with real-world usage data, rather than taste. The escalation engine
(`formats/escalate.ts`) returns the first format in the list that faithfully holds
a colour, so position 0 governs every opaque sRGB colour and the first
alpha-capable entry governs every translucent sRGB colour. The order should put the
formats developers actually read at those two load-bearing slots.

## Sources

- Web Almanac 2022, CSS chapter (HTTP Archive): https://almanac.httparchive.org/en/2022/css
- Web Almanac 2020, CSS chapter (HTTP Archive): https://almanac.httparchive.org/en/2020/css
- MDN `rgb()` reference (rgba is an alias for rgb): https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb

## Figures

Web Almanac 2020 measures **per colour occurrence** (per declaration, not per page):

| Format            | Desktop | Mobile |
| ----------------- | ------- | ------ |
| `#rrggbb` (6-hex) | 52%     | 50%    |
| `#rgb` (3-hex)    | 26%     | 25%    |
| `rgba()`          | 14%     | 14%    |
| `transparent`     | 8%      | 8%     |
| named colours     | ~1%     | ~1%    |
| `rgb()`           | 0.34%   | 0.34%  |
| `hsla()`          | 0.25%   | 0.25%  |
| `currentColor`    | ~0.14%  | ~0.14% |
| `hsl()`           | 0.01%   | 0.01%  |

Web Almanac 2022 confirms the same shape and adds the alpha split:

- 6-digit hex unchanged since 2021 (~half of all colour declarations).
- `rgba()` is the most widely used way to add alpha, ahead of 8-digit `#rrggbbaa`
  (which stays <1% despite full browser support), "likely because it was
  implemented in browsers much earlier."
- 23% of colour declarations support alpha; 77% do not.

## What the data says for the default order

1. **Solids are hex.** 6-hex + 3-hex is ~76% of all colour declarations. Hex is by
   far the format developers expect a solid colour to render as. Position 0 = `hex`.
2. **Alpha is `rgba()`, not 8-digit hex, not hsla.** `rgba()` (14%) dwarfs
   `#rrggbbaa` (<1%) and `hsla()` (0.25%). The first alpha-capable entry after `hex`
   should be `rgba`. This also matches the existing shadow/shelf test expectations,
   which render translucent colours as `rgba(...)`.
3. **`rgb()` functional is redundant (0.34%).** Same gamut and precision as `hex`,
   which already wins slot 0 for every opaque sRGB colour, so `rgb()` would never be
   reached by escalation. Dropped from the default ladder; still reachable via the
   `.rgb()` selector.
4. **`hsl`/`hwb`/`hexAlpha` are all <1%** and hold the same sRGB-plus-alpha colours as
   `rgba`, so `rgba` subsumes them. Dropped from the default ladder; reachable via
   their named selectors.
5. **The wide-gamut tail collapses to one floor.** `oklch` is unbounded, so it holds
   any colour `display-p3` / `lab` / `lch` / `oklab` could (and more). Those are
   dropped from the default ladder; `oklch` is the single floor, reachable formats
   stay available via their selectors.

## Resulting default priority

The ladder is pared to one format per distinct output space, most popular first, with
every format an earlier entry fully covers removed (it would never win escalation
anyway):

```
[hex, rgba, oklch]
```

- opaque `#5b4199` -> `#5b4199` (hex, slot 0)
- `#5b4199` @ 0.5 -> `rgba(91, 65, 153, 0.5)` (hex drops alpha, rgba is the next alpha-capable)
- anything wider than sRGB (P3 or beyond) -> `oklch(...)` (the unbounded floor)

Every dropped format stays reachable via an explicit selector (e.g. `.hsl().css()`);
this only trims the default escalation ladder, it does not remove a format.

Note: `rgba()` is formally an alias for `rgb()` (MDN); the comma form is kept as the
default alpha render because it is the form developers overwhelmingly read in the
wild, per the figures above.
