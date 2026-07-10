// The full hardening spectrum: i/f imperative hardening (existing), m's quartet
// (existing), m CARRYING an ingested hardened scalar (new), and the config-driven
// reaction (`ignore` / `warn` / `fail`) when arithmetic breaks a carried bound (new).
//
// Per docs/foundations.md: the hardening reaction is config-driven via the shared
// `Hardening = 'ignore' | 'warn' | 'fail'` type, set on the m() factory (and the
// corpus / compendium bundle `global`). Default is `fail` (preserves i/f's throw).
// The i/f + quartet blocks are regression coverage; the carry + config blocks
// exercise the new m behaviour.
import { describe, expect, it, vi } from 'vitest';

import {
  hardenFloat,
  hardenInteger,
  i,
  inRange,
  m,
  nonNegative,
} from '../../../src';
import { createCalipers } from '../../../src/factory';

describe('hardening spectrum', () => {
  /* ---- i / f imperative hardening (existing behaviour; regression) ---- */
  describe('i / f harden + re-validate through arithmetic', () => {
    it('hardenInteger enforces bounds at construction', () => {
      const fontWeight = hardenInteger({ min: 1, max: 1000 });
      expect(fontWeight(700).value()).toBe(700);
      expect(() => fontWeight(0)).toThrow(/below the minimum/);
      expect(() => fontWeight(1200)).toThrow(/above the maximum/);
    });

    it('hardenInteger re-validates through arithmetic (throws on breach)', () => {
      const bounded = hardenInteger({ min: 0, max: 10 });
      expect(bounded(4).multiply(2).value()).toBe(8); // in bounds
      expect(() => bounded(8).multiply(2)).toThrow(
        /above the maximum/,
      ); // 16 > 10
    });

    it('exposes its bounds via .constraints()', () => {
      expect(
        hardenInteger({ min: 0, max: 10 })(4).constraints(),
      ).toEqual({
        min: 0,
        max: 10,
      });
      expect(
        hardenFloat({ min: 0, max: 1 })(0.5).constraints(),
      ).toEqual({
        min: 0,
        max: 1,
      });
    });

    it('hardenFloat re-validates through arithmetic', () => {
      const alpha = hardenFloat({ min: 0, max: 1 });
      expect(() => alpha(0.6).multiply(2)).toThrow(
        /above the maximum/,
      ); // 1.2 > 1
    });
  });

  /* ---- m direct hardening via the quartet (existing) ---- */
  describe('m quartet (nonNegative / inRange)', () => {
    it('ensure passes in-bounds and throws out-of-bounds', () => {
      expect(nonNegative.ensure(m(4)).css()).toBe('4px');
      expect(() => nonNegative.ensure(m(-1))).toThrow();
      expect(inRange(0, 10).ensure(m(5)).css()).toBe('5px');
      expect(() => inRange(0, 10).ensure(m(15))).toThrow();
    });
  });

  /* ---- NEW: m carries an ingested hardened scalar ---- */
  describe('m carries an ingested hardened scalar', () => {
    it('keeps the scalar bounds as m.constraints()', () => {
      expect(
        m(hardenInteger({ min: 0, max: 10 })(8)).constraints(),
      ).toEqual({ min: 0, max: 10 });
    });

    it('an unhardened scalar carries no constraints', () => {
      expect(m(i(8)).constraints()).toEqual({});
    });
  });

  /* ---- NEW: config-driven reaction when math breaks a carried bound ---- */
  describe('hardening config when arithmetic breaks a carried bound', () => {
    const hardened = () => hardenInteger({ min: 0, max: 10 })(8);

    it("'ignore' drops the broken bound and proceeds", () => {
      const cal = createCalipers({ hardening: 'ignore' });
      expect(cal.m(hardened()).multiply(2).css()).toBe('16px');
    });

    it("'warn' warns but proceeds", () => {
      const spy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const cal = createCalipers({ hardening: 'warn' });
      expect(cal.m(hardened()).multiply(2).css()).toBe('16px');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it("'fail' throws on the breaking operation", () => {
      const cal = createCalipers({ hardening: 'fail' });
      expect(() => cal.m(hardened()).multiply(2)).toThrow();
    });

    it('an in-bounds operation never reacts, regardless of config', () => {
      const cal = createCalipers({ hardening: 'fail' });
      expect(cal.m(hardened()).multiply(1).css()).toBe('8px');
    });

    it('an unhardened scalar never reacts, regardless of config', () => {
      const cal = createCalipers({ hardening: 'fail' });
      expect(cal.m(i(8)).multiply(2).css()).toBe('16px');
    });
  });
});
