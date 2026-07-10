import { afterEach, describe, expect, it } from 'vitest';

import {
  createErrorConfigStore,
  createErrorHelpers,
  getErrorConfig,
  setErrorConfig,
  throwHelperError,
  throwMeasurementMethodError,
} from '../../../src/internal/errors';

/*
 * The module-level `throwMeasurementMethodError` / `throwHelperError` (the bare
 * functions that read the module-global error config, as opposed to the factory
 * `createErrorHelpers(store)` versions) plus the stack-hint config branches.
 *
 * These free functions are the public, instance-agnostic error throwers; the factory
 * threads its own store, so the module-level path is only exercised when the bare
 * functions are called directly. We drive each stack-hint branch by toggling the
 * module config and the per-call override, and assert the message/detail-block shape
 * actually produced (verified by running, not hand-derived).
 */

const baseParams: never[] = [];

afterEach(() => {
  // restore the module default so suites stay independent.
  setErrorConfig({ stackHints: 'auto' });
});

describe('errors — module-level throwHelperError', () => {
  it('builds the operation/message/context + detail block (no stack hint by default)', () => {
    setErrorConfig({ stackHints: 'auto' });
    let message = '';
    try {
      throwHelperError({
        operation: 'unitGuard',
        params: baseParams,
        message: 'Expected unit "px".',
        context: 'tokens.gap',
        details: { code: 'CALIPERS_E_ASSERT_UNIT' },
      });
    } catch (error) {
      message = (error as Error).message;
    }
    // auto + no override -> no stack hint; the base shape is context: op: msg [details].
    expect(message).toBe(
      'tokens.gap: unitGuard: Expected unit "px". [code=CALIPERS_E_ASSERT_UNIT]',
    );
    expect(message).not.toContain('stack=');
  });

  it('appends a stack hint when stackHints is "on"', () => {
    setErrorConfig({ stackHints: 'on' });
    let message = '';
    try {
      throwHelperError({
        operation: 'unitGuard',
        params: baseParams,
        message: 'boom',
      });
    } catch (error) {
      message = (error as Error).message;
    }
    // 'on' forces the stack-hint branch regardless of override.
    expect(message).toContain('unitGuard: boom');
    expect(message).toContain('stack=');
  });

  it('omits the stack hint when the per-call override is false even though config is "on"', () => {
    setErrorConfig({ stackHints: 'on' });
    let message = '';
    try {
      throwHelperError({
        operation: 'unitGuard',
        params: baseParams,
        message: 'boom',
        includeStackHint: false,
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toContain('stack=');
  });

  it('omits the stack hint when stackHints is "off"', () => {
    setErrorConfig({ stackHints: 'off' });
    let message = '';
    try {
      throwHelperError({
        operation: 'unitGuard',
        params: baseParams,
        message: 'boom',
        includeStackHint: true,
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toContain('stack=');
  });
});

describe('errors — module-level throwMeasurementMethodError', () => {
  it('builds the message and appends a stack hint when stackHints is "on"', () => {
    setErrorConfig({ stackHints: 'on' });
    let message = '';
    try {
      throwMeasurementMethodError({
        operation: 'divide',
        caller: { getUnit: () => 'px' } as never,
        params: baseParams,
        message: 'cannot divide by zero',
        details: { code: 'CALIPERS_E_DIVIDE_BY_ZERO' },
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('divide: cannot divide by zero');
    expect(message).toContain('code=CALIPERS_E_DIVIDE_BY_ZERO');
    expect(message).toContain('stack=');
  });

  it('omits the stack hint by default (auto + override true is gated by NODE_ENV, default false)', () => {
    setErrorConfig({ stackHints: 'auto' });
    let message = '';
    try {
      throwMeasurementMethodError({
        operation: 'add',
        caller: { getUnit: () => 'px' } as never,
        params: baseParams,
        message: 'unit mismatch',
      });
    } catch (error) {
      message = (error as Error).message;
    }
    // auto with no override resolves to no stack hint.
    expect(message).toBe('add: unit mismatch');
  });

  it('includes a stack hint under auto when the per-call override is true (dev env)', () => {
    setErrorConfig({ stackHints: 'auto' });
    let message = '';
    try {
      throwMeasurementMethodError({
        operation: 'clamp',
        caller: { getUnit: () => 'px' } as never,
        params: baseParams,
        message: 'invalid range',
        includeStackHint: true,
      });
    } catch (error) {
      message = (error as Error).message;
    }
    // auto + override true -> stack hint, because the test env is not production.
    expect(message).toContain('clamp: invalid range');
    expect(message).toContain('stack=');
  });
});

describe('errors — config stores', () => {
  it('getErrorConfig reflects setErrorConfig on the module store', () => {
    setErrorConfig({ stackHints: 'on' });
    expect(getErrorConfig().stackHints).toBe('on');
    setErrorConfig({ stackHints: 'off' });
    expect(getErrorConfig().stackHints).toBe('off');
  });

  it('createErrorConfigStore is independent of the module store', () => {
    const store = createErrorConfigStore({ stackHints: 'on' });
    setErrorConfig({ stackHints: 'off' });
    // the factory store keeps its own config, isolated from the module global.
    expect(store.getErrorConfig().stackHints).toBe('on');
    store.setErrorConfig({ stackHints: 'off' });
    expect(store.getErrorConfig().stackHints).toBe('off');
  });

  it('createErrorHelpers throws with the store config (stack hint on)', () => {
    const store = createErrorConfigStore({ stackHints: 'on' });
    const { throwHelperError: throwViaStore } =
      createErrorHelpers(store);
    let message = '';
    try {
      throwViaStore({
        operation: 'storeOp',
        params: baseParams,
        message: 'boom',
      });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('storeOp: boom');
    expect(message).toContain('stack=');
  });
});
