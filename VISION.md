# Vision and Roadmap

Status as of 2026-05-29. This file captures direction, not committed work. It is
intentionally separate from the README, which documents the library as it exists
today.

## The big picture: CSS-Bookends

The long-term home for this work is **CSS-Bookends**
(https://github.com/css-bookends/css-bookends): an umbrella library where each
"book" is a separate, standalone utility. CSS-Calipers is one book (the
measurement layer). Other concerns become their own books, grouped where it
makes sense:

- Spacing (padding and margin together, since they belong together)
- Colour (its own book)
- Borders (its own book)
- and so on, one cohesive concern per repo

Each book is independently usable and independently versioned, published under
the CSS-Bookends umbrella.

## Medium-term plan

1. Move the helpers that currently live alongside the measurement core out into
   their proper, separate repos.
2. Publish CSS-Calipers as **just the measurement layer** and take it to
   **v1.0**.
3. Release the extracted helper books as `0.x` while they stabilize.
4. Surface all of them through CSS-Bookends.

The intent is a stable, focused measurement primitive at 1.0, with the broader
ecosystem maturing around it at its own pace.

## Media queries: intentionally scoped

The `mediaQueries` module is a useful-if-you-want-it helper, not a full
implementation of the CSS media-query spec. Reworking it into a faithful
"full spec" layer would require a ground-up rebuild and a lot of design thought,
and that is deliberately out of scope for now. It stays as a convenience for the
cases it already handles well.
