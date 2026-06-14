/**
 * Example-only file.
 *
 * Not part of the public API surface or published bundle. This sketch shows
 * how css-calipers can participate in dev-only validation around design
 * tokens or configuration values inside style helpers or components. The
 * helpers here are framework-agnostic; imagine them being called from React,
 * a template system, or a Node script.
 *
 * The same `bodyLineHeight` token is used in two different places:
 * - an icon + label row that returns a small HTML snippet and enforces
 *   "icon must not exceed line-height"
 * - a table-of-contents heading row that returns a style object and enforces
 *   row height and body line-height invariants for readability
 *
 * See the sibling unit test example for how to assert related invariants in a unit test.
 *
 */

import { assertMatchingUnits, m } from '@css-bookends/css-calipers';

// Pretend these tokens come from a design token file or configuration layer.
// Two different components will enforce different invariants against the same
// underlying line-height measurement.
const bodyLineHeight = m(1.4, 'rem');
const iconTokenSize = m(1.2, 'rem');
const tocHeadingRowHeightToken = m(2, 'rem');

// An icon+label row where you don't want the icon to visually dominate the
// text. In development, assert that the icon's size does not exceed the
// line-height it sits next to. Here we return a small HTML snippet to
// illustrate string-based consumers.
export const renderIconWithLabelHtml = (
  labelText: string,
): string => {
  const iconSize = iconTokenSize;

  if (process.env.NODE_ENV !== 'production') {
    // Make sure both measurements use the same unit family before comparing.
    assertMatchingUnits(
      iconSize,
      bodyLineHeight,
      'iconWithLabel: icon and line-height units must match',
    );

    if (iconSize.getValue() > bodyLineHeight.getValue()) {
      throw new Error(
        `iconWithLabel: icon must not exceed line-height; ` +
          `iconSize=${iconSize.css()}, bodyLineHeight=${bodyLineHeight.css()}`,
      );
    }
  }

  const iconStyle = `width:${iconSize.css()};height:${iconSize.css()};`;
  const labelStyle = `line-height:${bodyLineHeight.css()};`;

  return `
    <span class="row">
      <span class="icon" style="${iconStyle}"/>
      <span class="label" style="${labelStyle}">${labelText}</span>
    </span>`;
};

// A table-of-contents row where H2 entries should remain readable and aligned
// with the typography system. In development, enforce a minimum line-height
// and require that the H2 row height is at least the underlying line-height.
export const buildTocHeadingStyles = () => {
  const tocHeadingRowHeight = tocHeadingRowHeightToken;

  if (process.env.NODE_ENV !== 'production') {
    // Require body line-height to stay within a reasonable range for body
    // text, using the same measurement token.
    const minBodyLineHeight = m(1.2, 'rem');
    const maxBodyLineHeight = m(1.8, 'rem');
    const bodyValue = bodyLineHeight.getValue();

    if (
      !(
        bodyValue >= minBodyLineHeight.getValue() &&
        bodyValue <= maxBodyLineHeight.getValue()
      )
    ) {
      throw new Error(
        `tocHeading: body line-height out of range; ` +
          `${bodyLineHeight.css()} (expected between ` +
          `${minBodyLineHeight.css()} and ${maxBodyLineHeight.css()})`,
      );
    }

    // Row height should not be smaller than the line-height it uses.
    assertMatchingUnits(
      tocHeadingRowHeight,
      bodyLineHeight,
      'tocHeading: row height and line-height units must match',
    );

    if (tocHeadingRowHeight.getValue() < bodyLineHeight.getValue()) {
      throw new Error(
        `tocHeading: row height must be >= line-height; ` +
          `row=${tocHeadingRowHeight.css()}, bodyLineHeight=${bodyLineHeight.css()}`,
      );
    }
  }

  // In real code these would be component or style objects. Here we just show
  // that measurement values flow through `.css()` into plain style shapes.
  return {
    row: {
      minHeight: tocHeadingRowHeight.css(),
      lineHeight: bodyLineHeight.css(),
    },
  };
};
