import { describe, expect, it } from 'vitest';

const esmContainerQueries = await import(
  '../../../dist/esm/containerQueries/index.js'
);

describe('API surface (containerQueries ESM)', () => {
  it('exposes the containerQueries runtime surface', () => {
    const keys = Object.keys(esmContainerQueries).filter(
      (key) => key !== '__esModule',
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
