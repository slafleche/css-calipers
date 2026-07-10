// Measurement introspection: .category() (the unit's CSS category) plus the
// length-family booleans, all driven by UNIT_DEFINITIONS. Rarer categories
// (time / frequency / resolution / flex) are answered via .category().
import { describe, expect, it } from 'vitest';

import { m } from '../../../src';

describe('m introspection: .category()', () => {
  it('returns the unit category', () => {
    expect(m(8).category()).toBe('length-absolute'); // px default
    expect(m(2, 'rem').category()).toBe('length-font-relative');
    expect(m(8, 'vw').category()).toBe('length-viewport');
    expect(m(8, 'cqw').category()).toBe('length-container');
    expect(m(50, '%').category()).toBe('percent');
    expect(m(90, 'deg').category()).toBe('angle');
    expect(m(1, 's').category()).toBe('time');
  });

  it('is undefined for an unknown unit', () => {
    expect(m(8, 'foo').category()).toBeUndefined();
  });
});

describe('m introspection: length-family booleans', () => {
  it('absolute lengths', () => {
    expect(m(8).isLength()).toBe(true);
    expect(m(8).isAbsolute()).toBe(true);
    expect(m(8).isRelative()).toBe(false);
  });

  it('relative lengths (font-relative / viewport / container)', () => {
    expect(m(2, 'rem').isRelative()).toBe(true);
    expect(m(2, 'rem').isAbsolute()).toBe(false);
    expect(m(8, 'vw').isRelative()).toBe(true);
    expect(m(8, 'cqw').isRelative()).toBe(true);
    expect(m(8, 'vw').isLength()).toBe(true);
  });

  it('non-length categories', () => {
    expect(m(50, '%').isPercent()).toBe(true);
    expect(m(50, '%').isLength()).toBe(false);
    expect(m(90, 'deg').isAngle()).toBe(true);
    expect(m(90, 'deg').isLength()).toBe(false);
    expect(m(1, 's').isLength()).toBe(false);
  });
});
