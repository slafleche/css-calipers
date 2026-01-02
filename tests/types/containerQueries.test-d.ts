import { expectAssignable, expectNotAssignable } from 'tsd';

import { m } from '../../dist/esm';
import { compare } from '../../dist/esm/comparisons';
import type {
  CSSContainerCondition,
  CSSContainerQueryRule,
  ContainerQueryComparison,
  ContainerQueryRange,
} from '../../dist/esm/containerQueries';
import { buildContainerRange } from '../../dist/esm/containerQueries';

const width = m(300, 'px');
const maxWidth = m(600, 'px');

const comparison: ContainerQueryComparison = compare.gte(width);

const range: ContainerQueryRange = buildContainerRange(width, maxWidth);

const condition: CSSContainerCondition = {
  and: [{ inlineSize: comparison }, { inlineSizeRange: range }],
};

const rule: CSSContainerQueryRule = {
  container: { name: 'sidebar', type: 'inline-size' },
  query: { name: 'sidebar', condition },
  styles: { padding: 8 },
};

expectAssignable<CSSContainerQueryRule>(rule);

expectNotAssignable<ContainerQueryComparison>({
  operator: '>=',
  value: width,
});

expectNotAssignable<ContainerQueryRange>({
  min: width,
  max: maxWidth,
  minOperator: '<',
});

expectNotAssignable<CSSContainerCondition>({
  inlineSize: { operator: '>=', value: width },
});
