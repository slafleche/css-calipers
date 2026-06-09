// Type-safe spacing math. CSS emitted only at the edges.
//
// Scratch file for manually verifying editor feedback. Open it in VS Code:
// the `paddingBase.add(rotation)` line below should show a red squiggle
// (px vs deg) with no terminal step. This folder is intentionally outside
// every build/test tsconfig, so the deliberate type error never breaks CI.

import { m } from "@css-bookends/css-calipers";

const paddingBase = m(4); // defaults to px
const margins = paddingBase.add(4);
const offset = paddingBase.add(margins).multiply(2).subtract(1);

const rotation = m(45, "deg");
paddingBase.add(rotation); // ✗ unit mismatch: px vs deg

// Example output
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const style = {
  padding: offset.css(),
  transform: `rotate(${rotation.double().css()})`,
};
