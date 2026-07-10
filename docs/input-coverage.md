# Input coverage: proof that calipers types the whole CSS value space

The claim this doc backs: **css-calipers can construct a typed, build-time-validated
value for every PRIMITIVE (non-composite) CSS input token** — the exact place `csstype`
leaves a gap. Composite grammars (gradients, `<position>`, `transform` lists, shorthands)
are built by the books layer on top of these primitives and are out of scope here.

This is a coverage argument, not an exhaustive property list. The exhaustive per-property
sweeps live in [`number-space.md`](./number-space.md) and
[`css-number-value-types.md`](./css-number-value-types.md) (the unitless-number surface,
verified against a full walk of the MDN property index).

## The gap

`csstype` types property names and their keywords well. For OPEN input values it falls back
to escape hatches, verified in `csstype/index.d.ts`:

```ts
type Opacity  = Globals | (string & {}) | (number & {});
type ZIndex   = Globals | "auto" | (number & {}) | (string & {});
type FlexGrow = Globals | (number & {}) | (string & {});
```

`(number & {})` accepts any number, `(string & {})` accepts any string. So `opacity: 1.5`,
a float `z-index`, or a `px` value written where an `em` was meant all type-check. There is
no way to CONSTRUCT a validated value from that type. That value layer is what calipers fills.

## The quantitative value space is a closed partition

Per the CSS Values and Units Module Level 4, every quantitative CSS input token is exactly
one of four shapes. calipers has one lexicon per shape, so the union is total:

| CSS shape (the whole quantitative space) | calipers lexicon |
| ---------------------------------------- | ---------------- |
| a plain whole number                     | `i()`            |
| a plain real number                      | `f()`            |
| a number with a unit (a *dimension*)     | `m()`            |
| a number over a number (a *ratio*)       | `r()`            |

Add `color()` for the colour value, and the primitive input space is covered. The proof of
each mapping:

### Every primitive token → its lexicon

| CSS primitive type | example CSS | lexicon | calipers call |
| ------------------ | ----------- | ------- | ------------- |
| `<integer>` | `z-index: 3` | `i()` | `i(3)` |
| `<number>` | `flex-grow: 2.5` | `f()` | `f(2.5)` |
| `<alpha-value>` (number form) | `opacity: .5` | `f()` in `[0,1]` | `hardenFloat({ min: 0, max: 1 })(0.5)` |
| `<ratio>` | `aspect-ratio: 16/9` | `r()` | `r(16, 9)` |
| `<percentage>` | `width: 50%` | `m()` | `mPercent(50)` · `m(50, '%')` |
| `<length>` | `margin: 8px` · `1.5rem` | `m()` | `m(8)` · `mRem(1.5)` |
| `<angle>` | `rotate: 45deg` | `m()` | `mDeg(45)` |
| `<time>` | `transition: .3s` | `m()` | `mS(0.3)` · `mMs(300)` |
| `<frequency>` | `pitch: 440Hz` | `m()` | `mHz(440)` |
| `<resolution>` | `min-resolution: 2dppx` | `m()` | `mDppx(2)` |
| `<flex>` | `grid-template: 1fr` | `m()` | `mFr(1)` |
| `<length-percentage>` (and the `*-percentage` pairs) | `10px` or `50%` | `m()` (both arms) | `m(10)` · `mPercent(50)` |
| `<dimension>` (generic number + unit) | any `<n><unit>` | `m()` | `m(2, 'x')` · `m(8, 'rlh')` |
| `<zero>` (unit-optional `0`) | `margin: 0` | `m()` / `i()` / `f()` | `m(0)` |
| `<color>` | `color: #3366cc` | `color()` | `color('#3366cc')` |

### Why `m()` closes the dimension arm completely

`m` is generic over the unit at the type level:

```ts
function m<Unit extends string>(value, unit): InscribedMeasurement<Lowercase<Unit>>;
```

The unit is `Unit extends string`, i.e. ANY string — so `m(2, 'x')` (the resolution alias
with no named helper), `m(8, 'rlh')`, or a unit CSS has not shipped yet all type-check and
carry their unit in the brand. The ~62 named helpers (`mPx`, `mDeg`, `mFr`, …) are ergonomic
shortcuts over that generic, not the limit of it. **Any string that is a number plus a unit
is an `m()`.** That is what makes the dimension arm total rather than a fixed enumeration.

### Constraints are added on top, not a separate primitive

The "constrained" primitives are the same four shapes plus a range/sign rule, expressed with
hardening — never a new lexicon:

- alpha `[0,1]`, font-weight `[1,1000]`, counts `>= 1`, `flex-grow >= 0` → `i()` / `f()` bounds
  (`i(v, { min, max })`, `hardenFloat({ min, max })`).
- non-negative / in-range measurements → the `m()` refinement quartet (`nonNegative`, `inRange`).

So the constrained space is covered by the same four lexicons, hardened.

## The honest boundary: non-numeric primitives

Four primitive tokens are NOT calipers lexicons, and by design:

| CSS primitive | example | status |
| ------------- | ------- | ------ |
| `<string>` | `content: "hi"` | csstype's `string` is adequate — no numeric/unit value to validate or construct |
| `<custom-ident>` | `animation-name: spin` | typed as `string` today; a real (small) validation gap — an identifier lexicon is possible future work |
| `<dashed-ident>` | `--gap`, an anchor name | must start with `--`; validated inline where used (e.g. `anchorSize`), no general lexicon |
| `<url>` | `url(a.png)` | string-shaped; not a constructed numeric value |

This is the honest edge of the claim: calipers is **total over the quantitative and colour
input space** — precisely where csstype degrades to `(number & {})` / `(string & {})`. For
string/ident/url tokens csstype already gives you `string`, and there is little build-time
value to construct in the same sense, so those are not part of the same gap. The one genuine
extension point is a `<custom-ident>` / `<dashed-ident>` lexicon, if identifier validation is
ever wanted; it would be a new, smaller gap, not a hole in the numeric/colour coverage above.

## In one line

Every CSS input value is a plain number (`i` / `f`), a number-with-unit (`m`, generic over
any unit), a ratio (`r`), a colour (`color`), or a string/identifier (csstype's `string`).
calipers supplies a typed, validated constructor for the first four — the whole space csstype
leaves open.
