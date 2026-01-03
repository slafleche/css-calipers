/**
 * Example-only file.
 *
 * This is not part of the public API surface and is not published in the
 * package. It shows how a page layout and a grid component can use different
 * media query configs (and different breakpoints) in the same codebase.
 */

import { m } from "css-calipers";
import {
  makeMediaQueryStyle,
  mediaQueryFactory,
} from "css-calipers/mediaQueries";

// Simple helper: grid component uses its own breakpoints and column labels.
// This helper uses the default builder, which includes all modules.
const gridBreakpoints = {
  columns_four: { maxWidth: m(1200) },
  columns_three: { maxWidth: m(1024) },
  columns_two: { maxWidth: m(768) },
  columns_one: { maxWidth: m(520) },
};

const gridMediaSimple = makeMediaQueryStyle(gridBreakpoints);

const gridStylesSimple = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(4, 1fr)",
  ...gridMediaSimple({
    columns_four: { gridTemplateColumns: "repeat(4, 1fr)" },
    columns_three: { gridTemplateColumns: "repeat(3, 1fr)" },
    columns_two: { gridTemplateColumns: "repeat(2, 1fr)" },
    columns_one: { gridTemplateColumns: "1fr" },
  }),
};

// Multiple instances: page layout and grid component use different configs.
// Layout uses the standard mobile/tablet/desktop breakpoints and defaults.
// The default keeps all modules enabled, if you want to limit modules, you
// can specify what moduels to load explicitely
const layoutMedia = mediaQueryFactory({
  queries: {
    mobile: { maxWidth: m(639) },
    tablet: { minWidth: m(640), maxWidth: m(1023) },
    desktop: { minWidth: m(1024) },
  },
  config: { label: "layout" },
});

// Grid uses a custom breakpoint map and custom error handling for iteration.
// Note "core" is explicit here and no other modules will be loaded.
const gridMedia = mediaQueryFactory({
  queries: gridBreakpoints,
  config: {
    label: "product-grid",
    modules: ["core"],
    errorHandling: {
      invalidValueMode: "log",
      lintingMode: "log",
    },
  },
});

const pageStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  ...layoutMedia({
    mobile: { gridTemplateColumns: "1fr" },
    tablet: { gridTemplateColumns: "repeat(2, 1fr)" },
    desktop: { gridTemplateColumns: "repeat(4, 1fr)" },
  }),
};

const gridStyles = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(4, 1fr)",
  ...gridMedia({
    columns_four: { gridTemplateColumns: "repeat(4, 1fr)" },
    columns_three: { gridTemplateColumns: "repeat(3, 1fr)" },
    columns_two: { gridTemplateColumns: "repeat(2, 1fr)" },
    columns_one: { gridTemplateColumns: "1fr" },
  }),
};

// Advanced example: any-hover with custom validation + linting.
// Note
const interactionMedia = mediaQueryFactory({
  queries: {
    not: {
      hoverReady: {
        anyHover: "hover",
        anyPointer: "fine",
        reducedMotion: "no-preference",
        and: {
          hoverDisabled: {
            anyHover: "none",
            anyPointer: "coarse",
            reducedMotion: "reduce",
          },
          or: {
            maxWidth: m(639),
            minWidth: m(1024),
          }
        },
        not: {
          hoverDisabled: {
            anyHover: "none",
            anyPointer: "coarse",
            reducedMotion: "reduce",
        },
        or: {
          maxWidth: m(639),
        }
      },
    }
  },
  config: {
    label: "interaction",
    modules: ["interaction", "preferences"],
    errorHandling: {
      invalidValueMode: "throw",
      lintingMode: "log",
    },
    output: (media) => ({
      label: "interaction",
      media,
      note: "Custom output for advanced example",
    }),
    custom: {
      key: "any-hover-guard",
      validator: (props) => {
        if (props.anyHover && !props.anyPointer) {
          return "anyHover should be paired with anyPointer for clarity";
        }
        return true;
      },
      linter: (props) => {
        if (props.anyHover === "none" && props.anyPointer === "fine") {
          return "anyHover none rarely pairs with anyPointer fine";
        }
        return true;
      },
    },
  },
});

const interactionResult = interactionMedia({
  hoverReady: { cursor: "pointer", transitionDuration: "160ms" },
  hoverDisabled: { cursor: "default", transitionDuration: "0ms" },
});

const interactionStyles = {
  ...interactionResult.media,
};
