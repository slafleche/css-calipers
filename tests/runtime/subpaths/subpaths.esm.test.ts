// Per-primitive subpath contract against the BUILT ESM bundle. Confirms the new
// entries (`measurements` / `ratio` / `integer` / `float` / `corpus`) resolve in
// `dist/esm` and carry the right surface (measurements/ratio/integer/float stay
// colour-free; corpus carries both `m` and `color`).
import { describe, expect, it } from 'vitest';

const esmMeasurements =
  await import('../../../dist/esm/measurements.js');
const esmRatio = await import('../../../dist/esm/ratio.js');
const esmInteger = await import('../../../dist/esm/integer.js');
const esmFloat = await import('../../../dist/esm/float.js');
const esmCorpus = await import('../../../dist/esm/corpus.js');

describe('per-primitive subpaths (ESM dist)', () => {
  it('measurements entry exposes `m` and is colour-free', () => {
    expect(typeof esmMeasurements.m).toBe('function');
    expect(esmMeasurements.m(8).css()).toBe('8px');
    expect('color' in esmMeasurements).toBe(false);
    expect('createColor' in esmMeasurements).toBe(false);
  });

  it('ratio entry exposes `r` and is colour-free', () => {
    expect(typeof esmRatio.r).toBe('function');
    expect('color' in esmRatio).toBe(false);
    expect('createColor' in esmRatio).toBe(false);
  });

  it('integer entry exposes `i` and is colour-free', () => {
    expect(typeof esmInteger.i).toBe('function');
    expect('color' in esmInteger).toBe(false);
    expect('createColor' in esmInteger).toBe(false);
  });

  it('float entry exposes `f` and is colour-free', () => {
    expect(typeof esmFloat.f).toBe('function');
    expect('color' in esmFloat).toBe(false);
    expect('createColor' in esmFloat).toBe(false);
  });

  it('corpus entry exposes BOTH `m` and `color`', () => {
    expect(typeof esmCorpus.m).toBe('function');
    expect(typeof esmCorpus.color).toBe('function');
    expect(typeof esmCorpus.createCalipers).toBe('function');
    expect(typeof esmCorpus.createColor).toBe('function');
  });
});
