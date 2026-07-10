// Direct behavioral tests for the scalar factories `createInteger` / `createFloat`.
// They were only reached indirectly through the bundle cascade; the split turns each
// into its own package, so drive the factory directly here: the configured hardening
// reaction must reach both the bound `i` / `f` helper and the `hardenInteger` /
// `hardenFloat` bound-constraint builders it returns.
import { describe, expect, it } from 'vitest';

import { createFloat } from '../../../src/float';
import { createInteger } from '../../../src/integer';

describe('createInteger (direct factory behavior)', () => {
  it('binds an i carrying the configured hardening reaction', () => {
    const strict = createInteger({ hardening: 'fail' });
    expect(() =>
      strict.i(8, { min: 0, max: 10 }).multiply(2),
    ).toThrow(/maximum/);

    const loose = createInteger({ hardening: 'ignore' });
    expect(loose.i(8, { min: 0, max: 10 }).multiply(2).value()).toBe(
      16,
    );
  });

  it('propagates the reaction to its hardenInteger builder', () => {
    const loose = createInteger({ hardening: 'ignore' });
    const fontWeight = loose.hardenInteger({ min: 0, max: 10 });
    expect(fontWeight(8).multiply(2).value()).toBe(16);
  });

  it('defaults to fail when no reaction is configured', () => {
    const c = createInteger();
    expect(() => c.i(8, { min: 0, max: 10 }).multiply(2)).toThrow(
      /maximum/,
    );
  });
});

describe('createFloat (direct factory behavior)', () => {
  it('binds an f carrying the configured hardening reaction', () => {
    const strict = createFloat({ hardening: 'fail' });
    expect(() =>
      strict.f(0.6, { min: 0, max: 1 }).multiply(2),
    ).toThrow(/maximum/);

    const loose = createFloat({ hardening: 'ignore' });
    expect(loose.f(0.6, { min: 0, max: 1 }).multiply(2).value()).toBe(
      1.2,
    );
  });

  it('propagates the reaction to its hardenFloat builder', () => {
    const loose = createFloat({ hardening: 'ignore' });
    const alpha = loose.hardenFloat({ min: 0, max: 1 });
    expect(alpha(0.6).multiply(2).value()).toBe(1.2);
  });

  it('defaults to fail when no reaction is configured', () => {
    const c = createFloat();
    expect(() => c.f(0.6, { min: 0, max: 1 }).multiply(2)).toThrow(
      /maximum/,
    );
  });
});
