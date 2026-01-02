import { describe, expect, it } from 'vitest';

const esmContainerQueries = await import(
  '../../../dist/esm/containerQueries/index.js'
);

describe('API surface (containerQueries ESM)', () => {
  it('exposes an empty runtime surface for types-only entrypoint', () => {
    const keys = Object.keys(esmContainerQueries).filter(
      (key) => key !== '__esModule',
    );
    expect(keys).toEqual([]);
  });
});
