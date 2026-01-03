# Container Queries (@container) TODO

## Arrays

### Media queries

- [ ] minWidth
- [ ] maxWidth
- [ ] width
- [ ] minHeight
- [ ] maxHeight
- [ ] height
- [ ] aspectRatio
- [ ] minAspectRatio
- [ ] maxAspectRatio
- [ ] resolutionValue
- [ ] minResolution
- [ ] maxResolution

### Container queries

- [ ] minWidth
- [ ] maxWidth
- [ ] minHeight
- [ ] maxHeight
- [ ] inlineSize
- [ ] inlineSizeRange
- [ ] blockSize
- [ ] blockSizeRange
- [ ] aspectRatio
- [ ] minAspectRatio
- [ ] maxAspectRatio
- [ ] Custom feature values
- [ ] media custom features
- [ ] container custom features

### Notes

- Step 1: Add tests for custom media queries and custom container queries where single value passes and array fails. These are expected to fail now and will flip once array support is added or custom features are configured to allow arrays.
  We clarified that array support is about fields inside queries, not about queries themselves.

We clarified that arrays should be considered for both media queries and container queries, not just one of them.

We clarified that tests should be added in both type tests and runtime tests, with separate coverage for media queries and container queries.

We clarified the expected test behavior: single values should pass as they do now, while arrays should fail for now so tests are red until the feature is implemented.

We clarified that custom features should be included in the first step: add tests that show single values pass and arrays fail, even though custom features can later be configured to allow arrays.

We clarified that tests should live in the existing media and container test locations.


## Check on custom tests
- [ ] simplify/lint bad array data



## logical nesting

- [ ] and
- [ ] or
- [ ] not

## TODO (runtime phase, later)

- [ ] Add validation/linting hooks and config, matching mediaQueries patterns.
- [ ] Add runtime tests for builder behavior and error handling.

## Update Docs

- [ ] Update docs, search for inconsistencies
