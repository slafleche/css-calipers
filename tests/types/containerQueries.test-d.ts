import { expectAssignable } from 'tsd';

import { m } from '../../dist/esm';
import type {
  CSSContainerCondition,
  CSSContainerQueryRule,
  CSSContainerStyleQuery,
  ContainerQueryComparison,
  ContainerQueryRange,
} from '../../dist/esm/containerQueries';

const width = m(300, 'px');
const maxWidth = m(600, 'px');

const comparison: ContainerQueryComparison = {
  operator: '>=',
  value: width,
};

const range: ContainerQueryRange = {
  min: width,
  max: maxWidth,
  minOperator: '<',
  maxOperator: '<=',
};

const styleQuery: CSSContainerStyleQuery = {
  display: 'grid',
};

const condition: CSSContainerCondition = {
  and: [{ width: comparison }, { widthRange: range }, { style: styleQuery }],
};

const rule: CSSContainerQueryRule = {
  container: { name: 'sidebar', type: 'inline-size' },
  query: { name: 'sidebar', condition },
  styles: { padding: 8 },
};

expectAssignable<CSSContainerQueryRule>(rule);
