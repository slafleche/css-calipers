/**
 * Example-only file.
 *
 * This is not part of the public API surface and is not published in the
 * package. It shows how to nest media + container query outputs, including
 * optional vanilla-extract helpers.
 */

import { m, r } from "css-calipers";
import { makeMediaQueryStyle } from "css-calipers/mediaQueries";
import { makeContainerQueryStyle } from "css-calipers/containerQueries";
import {
  containerQueryOutputVanillaExtract,
  mediaQueryOutputVanillaExtract,
} from "css-calipers/mediaQueries";
import { compare } from "../src/comparisons";

const media = makeMediaQueryStyle({
  desktop: {
    minWidth: m(1024),
    aspectRatio: r(16, 9),
  },
});

const media2 = makeMediaQueryStyle({
  queryA: {
    minWidth: m(1024),
    maxWidth: m(2024),
    and: {
      minResolution: m(2, "dppx"),
      not: {
        aspectRatio: r(16, 9),
      },
    },
  },
});

const container = makeContainerQueryStyle({
  wideCard: {
    inlineSize: compare.gte(m(28, "rem")),
    and: {
      aspectRatio: r(4, 3),
    },
    not: {
      blockSize: [compare.lt(m(400, "px")), compare.lt(m(1200, "px"))],
      or: {
        aspectRatio: r(16, 9),
      },
    },
  },
});

const nestedStyles = media({
  desktop: container({
    wideCard: {
      gridTemplateColumns: "1fr 2fr",
      gridTemplateRows: "none",
      alignItems: "stretch",
    },
  }),
});

// const vanillaExtractStyles = mediaQueryOutputVanillaExtract(
//   media({
//     desktop: containerQueryOutputVanillaExtract(
//       container({
//         wideCard: {
//           gridTemplateColumns: "1fr 2fr",
//           gridTemplateRows: "none",
//         },
//       }),
//     ),
//   }),
// );
