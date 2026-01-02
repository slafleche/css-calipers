import { describe, expect, it } from 'vitest';

const cjsContainerQueries = await import(
  '../../../dist/cjs/containerQueries/index.js'
);

describe('API surface (containerQueries CJS)', () => {
  it('exposes an empty runtime surface for types-only entrypoint', () => {
    const keys = Object.keys(cjsContainerQueries).filter(
      (key) => key !== '__esModule',
    );
    expect(keys).toEqual([]);
  });
});
