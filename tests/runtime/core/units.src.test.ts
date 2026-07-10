// Exhaustive unit regression net. Every generated unit helper must round-trip its
// CSS unit string and report its category. Cheap and table-driven over the whole
// `UNIT_DEFINITIONS` registry, so the ~72 helpers are all behaviorally asserted,
// not just export-name-checked. This is the net for the split: units move into their
// own package, and a bad move would break `<helper>(1).css() === '1<unit>'` here.
import { describe, expect, it } from 'vitest';

import { UNIT_DEFINITIONS } from '../../../src/unitDefinitions';
import * as units from '../../../src/units';

type UnitHelper = (value: number) => {
  css: () => string;
  category: () => string | undefined;
};

const helpers = units as unknown as Record<string, UnitHelper>;

describe('every unit helper round-trips its CSS unit + reports its category', () => {
  for (const [
    name,
    def,
  ] of Object.entries(UNIT_DEFINITIONS)) {
    it(`${name}(1).css() === '1${def.unit}' and category '${def.category}'`, () => {
      const helper = helpers[name];
      expect(helper, `${name} exported from ./units`).toBeTypeOf(
        'function',
      );
      const value = helper(1);
      expect(value.css()).toBe(`1${def.unit}`);
      expect(value.category()).toBe(def.category);
    });
  }
});
