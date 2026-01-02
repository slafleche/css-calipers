/**
 * Example-only file.
 *
 * This is not part of the public API surface and is not published in the
 * package. It shows how to nest media + container query outputs, including
 * optional vanilla-extract helpers.
 */

import { style } from "@vanilla-extract/css";
import { m, makeMediaQueryStyle } from "./factory-wrapper.example";
import { makeContainerQueryStyle } from "../src/containerQueries";
import { compare } from "../src/comparisons";

const media = makeMediaQueryStyle({
  desktop: { minWidth: m(1024) },
});

const container = makeContainerQueryStyle({
  wideCard: {
    inlineSize: compare.gte(m(28, "rem")),
  },
});

// const nestedStyles = media({
//   desktop: container({
//     wideCard: {
//       gridTemplateColumns: "1fr 2fr",
//       gridTemplateRows: "none",
//       alignItems: "stretch",
//     },
//   }),
// });

const sampleClasses = {
  container: style({
    display: "flex",
    flexDirection: "column",
  }),
  logo: style({}),
  text: style({}),
};

const sampleComponent = `
  <div className={container}>
    <div className={logo}>Logo</div>
    <div className={text}>Some text here</div>
  </div>
`;

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
