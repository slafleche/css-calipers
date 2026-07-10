/**
 * Example-only file.
 *
 * Not part of the public API surface and not published. It demonstrates the
 * unified value surface across `m()` / `i()` / `f()`, measurement introspection,
 * the config-driven hardening reaction, and the bundle config cascade.
 */

import {
  createCalipersBundle,
  createInteger,
  f,
  hardenInteger,
  i,
  m,
} from '@css-bookends/css-calipers';

// --- m() accepts a plain number OR a typed scalar (i / f) -----------------------

export const fromInteger = m(i(8)).css(); // '8px'
export const fromFloat = m(f(2.5), 'rem').css(); // '2.5rem'

// --- one raw / unit accessor across every value type ---------------------------

export const rawValue = m(2.5, 'rem').value(); // 2.5
export const unitString = m(2.5, 'rem').unit(); // 'rem'
export const scalarUnit = i(4).unit(); // ''  (unitless)

// --- introspection + interconversion -------------------------------------------

export const category = m(8).category(); // 'length-absolute'
export const isAbsolute = m(8).isAbsolute(); // true
export const isRelative = m(2, 'rem').isRelative(); // true
export const isPercent = m(50, '%').isPercent(); // true
export const recovered = m(2.5).toTypedValue().css(); // '2.5'  (fractional -> f)
export const integral = m(8).isInt(); // true

// --- m carries an ingested hardened bound; reaction is config-driven ------------

const bounded = hardenInteger({ min: 0, max: 10 });

export const carriedBound = m(bounded(8)).constraints(); // { min: 0, max: 10 }

// Default 'fail': breaking the carried bound throws.
export const breakThrows = (): string => {
  try {
    m(bounded(8)).multiply(2); // 16 breaks [0, 10]
    return 'no throw';
  } catch {
    return 'threw';
  }
};

// 'ignore' / 'warn' instances drop the broken bound and proceed.
const lenient = createCalipersBundle({
  measurements: { hardening: 'ignore' },
});
export const lenientResult = lenient.m(bounded(8)).multiply(2).css(); // '16px'

// --- the integer / float factories bake the same reaction ----------------------

const ints = createInteger({ hardening: 'ignore' });
export const relaxedInt = ints
  .i(8, { min: 0, max: 10 })
  .multiply(2)
  .value(); // 16

// --- the bundle cascade: own key -> global -> factory default -------------------

const bundle = createCalipersBundle({
  global: { hardening: 'warn' }, // applies everywhere...
  integer: { hardening: 'fail' }, // ...except integers, which throw
});

export const bundleFloatRelaxed = bundle
  .f(0.6, { min: 0, max: 1 })
  .multiply(2)
  .value(); // 1.2  (warn from global, proceeds)

export const bundleIntStrict = (): string => {
  try {
    bundle.i(8, { min: 0, max: 10 }).multiply(2); // integer key = fail
    return 'no throw';
  } catch {
    return 'threw';
  }
};
