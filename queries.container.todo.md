# Container Queries (@container) TODO

## Primer
Goal: add container query support that mirrors the mediaQueries module in
structure and ergonomics, but starts with full types first.

Scope direction:
- Full type layer first (no runtime builders yet).
- Follow the same core/modular approach as mediaQueries.
- Provide a containerQueries module with sub-modules to enable tree shaking.

## Clarifying Questions (please answer)
1) Do you want the type layer to include builder helpers and output mappers
   (type-only signatures), or strictly data shapes?
2) Should the container query API mirror mediaQueries naming (buildContainerQueryString,
   makeContainerQueryStyle, containerQueryFactory), or use new names?
3) Do you want container style queries in v1 (style() conditions), or only size
   features initially?
4) Should the type layer include a config object for validation/linting modes
   like mediaQueries, even before runtime helpers exist?
5) Do you want container query rules to accept IMeasurement only, or allow raw
   numbers/strings like mediaQueries custom features?
6) For CSSComparison and CSSRange shapes, do you prefer object forms like
   { operator: ">=", value } and { min, max }, or something else?

## Answers
- 1) Only data shapes, but cover full CSS spec and use CSSTypes.
- 2) Mirror mediaQueries naming (buildContainerQueryString, makeContainerQueryStyle, containerQueryFactory).
- 3) Include style() conditions in the types-only pass.
- 4) Include config types for validation and linting modes, mirroring mediaQueries.
- 5) Require IMeasurement for unit-bearing values; otherwise use CSSTypes types.
- 6) Deferred to phase 2 discussion; phase 1 is CSS spec only.
- 2) TODO
- 3) TODO
- 4) TODO
- 5) TODO

## TODO (types-first phase)
- [x] Define containerQueries module layout mirroring mediaQueries (index + modules).
- [x] Add core container query types (names, types, and rule shapes).
- [x] Add size feature types and comparison/range helpers (type-level only).
- [x] Add style query types for style() conditions (if in scope).
- [x] Add container query props + styles mapping types.
- [x] Add public index exports and per-module exports for tree shaking.
- [x] Add types tests for containerQueries public API surface.
- [x] Add docs or README section stub describing container query types.

## TODO (runtime phase, later)
- [ ] Build container query builders mirroring mediaQueries core.
- [ ] Add validation/linting hooks and config, matching mediaQueries patterns.
- [ ] Add factory helpers and module selection support.
- [ ] Add runtime tests for builder behavior and error handling.
