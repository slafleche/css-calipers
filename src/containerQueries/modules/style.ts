import type { Properties } from 'csstype';

export type CSSContainerStyleQuery = Partial<
  Record<keyof Properties, string | number>
>;
