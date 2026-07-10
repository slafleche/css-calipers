// The UNIFIED value surface: one raw/unit accessor across all value types —
// `.value()` (raw number) + `.unit()` (unit string, empty for unitless).
// Measurements keep `.getValue()` / `.getUnit()` as DEPRECATED aliases.
import { describe, expect, it } from 'vitest';

import { f, i, m } from '../../../src';

describe('unified value surface: .value() + .unit()', () => {
  describe('measurement', () => {
    it('.value() returns the raw number', () => {
      expect(m(8).value()).toBe(8);
      expect(m(2.5, 'rem').value()).toBe(2.5);
    });

    it('.unit() returns the unit string', () => {
      expect(m(8).unit()).toBe('px');
      expect(m(2.5, 'rem').unit()).toBe('rem');
    });

    it('keeps getValue() / getUnit() as (deprecated) aliases', () => {
      expect(m(8).getValue()).toBe(8);
      expect(m(8, 'rem').getUnit()).toBe('rem');
    });
  });

  describe('integer / float (unitless)', () => {
    it('.value() returns the raw number', () => {
      expect(i(4).value()).toBe(4);
      expect(f(2.5).value()).toBe(2.5);
    });

    it('.unit() is empty for unitless scalars', () => {
      expect(i(4).unit()).toBe('');
      expect(f(2.5).unit()).toBe('');
    });
  });
});
