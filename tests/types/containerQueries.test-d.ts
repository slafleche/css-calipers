import { expectAssignable, expectNotAssignable } from 'tsd';

import { m, r } from '../../dist/esm';
import { compare } from '../../dist/esm/comparisons';
import type {
  CSSContainerCondition,
  CSSContainerQueryRuleInput,
  CSSContainerQueryRuleOutput,
  ContainerQueryComparison,
  ContainerQueryRange,
  IContainerQueryProps,
} from '../../dist/esm/containerQueries';
import { buildContainerRange } from '../../dist/esm/containerQueries';

const width = m(300, 'px');
const maxWidth = m(600, 'px');

const comparison: ContainerQueryComparison = compare.gte(width);

const range: ContainerQueryRange = buildContainerRange(width, maxWidth);

const condition: CSSContainerCondition = {
  and: [{ inlineSize: comparison }, { inlineSizeRange: range }],
};

const ruleInput: CSSContainerQueryRuleInput = {
  container: { name: 'sidebar', type: 'inline-size' },
  query: { name: 'sidebar', condition },
};

const ruleOutput: CSSContainerQueryRuleOutput = {
  ...ruleInput,
  styles: { padding: 8 },
};

expectAssignable<CSSContainerQueryRuleInput>(ruleInput);
expectAssignable<CSSContainerQueryRuleOutput>(ruleOutput);

expectAssignable<IContainerQueryProps>({ minWidth: m(320) });
expectAssignable<IContainerQueryProps>({ maxWidth: m(1024) });
expectAssignable<IContainerQueryProps>({ minHeight: m(480) });
expectAssignable<IContainerQueryProps>({ maxHeight: m(900) });
expectAssignable<IContainerQueryProps>({
  inlineSize: compare.gte(m(12)),
});
expectAssignable<IContainerQueryProps>({
  inlineSizeRange: buildContainerRange(m(10), m(20)),
});
expectAssignable<IContainerQueryProps>({
  blockSize: compare.lt(m(24)),
});
expectAssignable<IContainerQueryProps>({
  blockSizeRange: buildContainerRange(m(24), m(48)),
});
expectAssignable<IContainerQueryProps>({ aspectRatio: r(16, 9) });
expectAssignable<IContainerQueryProps>({ minAspectRatio: r(4, 3) });
expectAssignable<IContainerQueryProps>({ maxAspectRatio: r(21, 9) });
expectAssignable<IContainerQueryProps>({
  customFeatures: { 'custom-flag': 'on' },
});

expectAssignable<IContainerQueryProps>({
  minWidth: [m(320), m(640)],
});
expectAssignable<IContainerQueryProps>({
  maxWidth: [m(1024), m(1280)],
});
expectAssignable<IContainerQueryProps>({
  minHeight: [m(480), m(640)],
});
expectAssignable<IContainerQueryProps>({
  maxHeight: [m(900), m(1080)],
});
expectAssignable<IContainerQueryProps>({
  inlineSize: [compare.gte(m(12)), compare.lt(m(24))],
});
expectAssignable<IContainerQueryProps>({
  inlineSizeRange: [
    buildContainerRange(m(10), m(20)),
    buildContainerRange(m(24), m(30)),
  ],
});
expectAssignable<IContainerQueryProps>({
  blockSize: [compare.lt(m(24)), compare.gte(m(48))],
});
expectAssignable<IContainerQueryProps>({
  blockSizeRange: [
    buildContainerRange(m(24), m(48)),
    buildContainerRange(m(50), m(80)),
  ],
});
expectAssignable<IContainerQueryProps>({
  aspectRatio: [r(16, 9), r(4, 3)],
});
expectAssignable<IContainerQueryProps>({
  minAspectRatio: [r(4, 3), r(3, 2)],
});
expectAssignable<IContainerQueryProps>({
  maxAspectRatio: [r(21, 9), r(16, 9)],
});
expectAssignable<IContainerQueryProps>({
  customFeatures: { 'custom-flag': ['on', 'off'] },
});

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
