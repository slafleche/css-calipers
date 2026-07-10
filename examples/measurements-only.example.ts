/**
 * Example-only file. Not part of the public API surface and not published.
 *
 * The colour-free path. Importing from the `/measurements` and `/units` subpaths
 * pulls in only the measurement lexicon and its unit helpers, with NO colour, so no
 * `culori` in the dependency graph. This is the standalone, minimal-footprint way to
 * use calipers when you want typed lengths / angles / etc. and nothing else.
 */
import { m } from '@css-bookends/css-calipers/measurements';
import { mRem, mVw } from '@css-bookends/css-calipers/units';

export const px = m(8).css(); // '8px'
export const rem = mRem(1.5).css(); // '1.5rem'
export const vw = mVw(50).css(); // '50vw'

// arithmetic stays in measurement space; render once, at the edge.
export const doubled = m(8).multiply(2).css(); // '16px'
