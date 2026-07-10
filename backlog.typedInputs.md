# Backlog: typed CSS inputs (the full-inputs-package work)

Tracking loose ends from making css-calipers the full typed-CSS-inputs package
(measurements, ratios, integers, floats, colour, per-property atoms). Captured
2026-06-24.

## Colour fold loose ends (from Phase 1)

- **3 pre-existing red tests** (`books/shadows` x1, `packages/compendium` x2) assert
  `rgba(...)`, but the default colour priority is hex-first
  (`defaultFormatPriority = [hex, rgb, hexAlpha, rgba, ...]`). A 0.5-alpha colour
  renders `#5b419980` (hexAlpha), never reaching rgba. Stale assertions that
  predate the fold (verified failing at HEAD). Resolve one of three ways: flip the
  assertions to the actual hex output, set those books'/compendium's colour config to
  `output: colorFormats.rgba` if rgba is the intended product default, or fold it
  into the colour culori-rewrite. See the root `package.json` `//temp-exclude` note.
- **Colour modification gaps: ALL filled (2026-06-25).** In
  `tests/runtime/color/color.matrix.src.test.ts`. First wave (unambiguous,
  OKLCH-coordinate / culori-pinned): `setLightness`, `setChroma`, `setHue`,
  `complement` (hue + 180), `contrast` (culori `wcagContrast` reference). Second wave
  (the 6 former design-question stubs, decisions recorded below): `invert`,
  `grayscale`, `blend` (multiply/screen/+9 modes), `ensureContrast`. No `it.todo` /
  deliberate-fail stubs remain; the colour suite is fully green.
- **`./color` subpath is emitted but unused by the workspace.** Calipers'
  `package.json` exports `./color` and the build emits `dist/*/color/**`, but the
  colour surface is re-exported from the calipers ROOT because colour's tsconfig
  uses classic `Node` resolution (ignores `exports`). Switch to the `./color`
  subpath import if/when consumers move to `node16`/`bundler` resolution.
- **Colour is still excluded from lint/typecheck** (root `//temp-exclude`,
  "pending its documented culori-rewrite gaps"). Restore once the rewrite lands
  (delete the `--filter='!...'` flags + the matching set in `lint-staged.config.mts`).

## Colour modification gaps (design questions) — RESOLVED 2026-06-25

The 6 former-`it.todo` modification cells, now implemented in `src/color/index.ts`
with the decisions below. Kept here as the rationale record.

- **`blend(other, mode)`** — DECIDED: a single flat method taking a typed `BlendMode`
  union (the 11 separable CSS modes: multiply, screen, overlay, darken, lighten,
  color-dodge, color-burn, hard-light, soft-light, difference, exclusion). Computed in
  **sRGB**, not OKLCH: separable blend modes are sRGB-defined per-channel formulas
  (multiply = `r1*r2`) with no meaning on OKLCH's signed a/b coordinates. Both operands
  are gamut-mapped into sRGB first (a no-op for in-gamut colours, so lossless there;
  wide-gamut operands are mapped down, inherent to blend modes being sRGB-only).
  Storage stays canonical OKLCH (the sRGB result is re-normalized via `withColor`).
  Backed by culori `blend([a, b], mode, 'rgb')`.
- **`invert(amount = 1)`** — DECIDED: **OKLCH lightness inversion** (`L -> 1 - L`,
  chroma + hue kept), not an sRGB channel matrix. `amount` (0..1) interpolates
  original <-> inverted; `0.5` lands on mid lightness for any colour.
- **`grayscale(amount = 1)`** — DECIDED: **OKLCH chroma to zero** (`C -> C*(1-amount)`,
  lightness + hue kept), the natural reading for the OKLCH store.
- **`ensureContrast(other, ratio = 4.5)`** — DECIDED: adjust THIS colour's OKLCH
  lightness toward whichever endpoint (black `L=0` / white `L=1`) increases WCAG
  contrast against `other`, binary-searching the SMALLEST move that meets `ratio`
  (default 4.5 = AA; pass 7 for AAA). If unreachable even at the endpoint, return the
  best-achievable (max-contrast) colour. Reuses the `wcagContrast` reference behind
  `contrast()`.

## Phase 2 deferred properties (per-property helpers not in v1)

v1 covered the clean single-value scalars; the multi-part grammars are now mostly built.

**Built (task #15, green), in `src/css-values/multi.ts`:** the counter trio
(`<custom-ident> <integer>` pairs + `none`), grid line numbers
(`<integer>` | `span <integer>` | named line | `auto`, via a `span()` builder),
multi-value `scale` (1 to 3 number factors | `none`), and `tab-size` (the `<number>`
form, plus a length supplied as an `IMeasurement`).

**Still deferred:**
- **Border-image / mask-border multipliers:** `border-image-width/outset/slice`,
  `mask-border-width/outset/slice` (number multiplier OR length/percentage, 1 to 4 values).
- **Stroke tier** (number form is a unitless SVG-user-unit input; length form is `m()`'s):
  `stroke-width`, `stroke-dashoffset`, `stroke-dasharray`.
- **`readingOrder`** (found by the MDN sweep, task #16): a bare unbounded `<integer>`, same
  group as `order`. Deferred because csstype 3.2.3 has no `Property.ReadingOrder` key
  (CSS Display L4 is too new); add the helper once csstype gains the key.
- **Skipped (font-defined / weak bound):** `font-variation-settings`, `font-feature-settings`.

**Recheck (MDN 404 during the sweep, grammars unconfirmed):** `baseline-shift`, `column-height`.

## Research / docs gates

- **Full ~600-entry MDN property sweep** for belt-and-suspenders coverage (v1 built
  from the ~43 verified properties in `docs/css-number-value-types.md`).
- **`johanneslumpe/css-types` VERIFIED (2026-06-24), gate cleared.** Closest prior
  art, and it ships TYPES ONLY (generated from MDN, for styled-props). Its README
  states the branded value helpers are NOT implemented: "functions are aliased to
  `string`, instead of auto-generated helper functions which return branded types."
  No CSS emission, no property-range hardening, no arithmetic, no colour. Positioning
  consequence: ACKNOWLEDGE it as the nearest neighbour (it named the same aspiration),
  then claim the REALIZATION, not the idea: the built, hardened, CSS-emitting,
  colour-inclusive runtime input layer does not exist elsewhere. Source:
  github.com/johanneslumpe/css-types.
- **Full ~600-entry MDN property sweep** for belt-and-suspenders coverage (still open).
