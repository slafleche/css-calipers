import { describe, expect, it } from 'vitest';

const cjsContainerQueries = await import(
  '../../../dist/cjs/containerQueries/index.js'
);

describe('API surface (containerQueries CJS)', () => {
  it('exposes the containerQueries runtime surface', () => {
    const keys = Object.keys(cjsContainerQueries).filter(
      (key) =>
        key !== '__esModule' &&
        key !== 'default' &&
        key !== 'module.exports',
    );
    expect(keys.sort()).toEqual(
      [
        'buildContainerComparison',
        'buildContainerConditionString',
        'buildContainerQueryString',
        'buildContainerRange',
        'containerQueryFactory',
        'createContainerQueryFactory',
        'defineContainerQueryModules',
        'formatContainerQueryValue',
        'makeContainerQueryStyle',
      ].sort(),
    );
  });
});
