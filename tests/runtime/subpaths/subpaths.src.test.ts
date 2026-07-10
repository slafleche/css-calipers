// Per-primitive subpath contract (src level). Each entry must expose only the
// surface it owns. The measurements / ratio / integer / float entries MUST be
// colour-free (no `color`, no `createColor`), so a consumer who imports them
// never pulls in culori. The `corpus` lazy-defaults entry re-exports the full
// default set, so it MUST expose BOTH `m` and `color`.
import { describe, expect, it } from 'vitest';

import * as corpus from '../../../src/corpus';
import { f as fEntry } from '../../../src/float';
import { i as iEntry } from '../../../src/integer';
import * as meas from '../../../src/measurements';
import { r as rEntry } from '../../../src/ratio';

describe('per-primitive subpaths (src)', () => {
  it('measurements entry exposes a working `m`', () => {
    expect(typeof meas.m).toBe('function');
    expect(meas.m(8).css()).toBe('8px');
  });

  it('measurements entry is colour-free', () => {
    expect('color' in meas).toBe(false);
    expect('createColor' in meas).toBe(false);
  });

  it('ratio entry exposes `r` and is colour-free', async () => {
    expect(typeof rEntry).toBe('function');
    expect(rEntry(16, 9).css()).toBe('16/9');
    const ratioModule = await import('../../../src/ratio');
    expect('color' in ratioModule).toBe(false);
    expect('createColor' in ratioModule).toBe(false);
  });

  it('integer entry exposes `i` and is colour-free', async () => {
    expect(typeof iEntry).toBe('function');
    expect(iEntry(3).css()).toBe('3');
    const integerModule = await import('../../../src/integer');
    expect('color' in integerModule).toBe(false);
    expect('createColor' in integerModule).toBe(false);
  });

  it('float entry exposes `f` and is colour-free', async () => {
    expect(typeof fEntry).toBe('function');
    expect(fEntry(1.5).css()).toBe('1.5');
    const floatModule = await import('../../../src/float');
    expect('color' in floatModule).toBe(false);
    expect('createColor' in floatModule).toBe(false);
  });

  it('corpus entry exposes BOTH `m` and `color` (full default set)', () => {
    expect('m' in corpus).toBe(true);
    expect('color' in corpus).toBe(true);
    expect(typeof corpus.m).toBe('function');
    expect(typeof corpus.color).toBe('function');
    expect(corpus.m(8).css()).toBe('8px');
  });

  it('corpus also exposes the factories', () => {
    expect(typeof corpus.createCalipers).toBe('function');
    expect(typeof corpus.createColor).toBe('function');
  });

  it('corpus DEFAULT-exports the master factory and binds everything at defaults', () => {
    // the default export is the master factory (same fn as the named export).
    expect(typeof corpus.default).toBe('function');
    expect(corpus.default).toBe(corpus.createCalipersBundle);
    // a bare call binds the whole calipers surface at defaults.
    const c = corpus.createCalipersBundle();
    expect(c.m(8).css()).toBe('8px');
    expect(typeof c.color).toBe('function');
    expect(c.color('#3366cc').css()).toBe('#3366cc');
    // the keyed config threads through to the sub-factory.
    const strict = corpus.createCalipersBundle({
      measurements: { errorConfig: { stackHints: 'off' } },
    });
    expect(strict.m(8).css()).toBe('8px');
  });
});
