# CSS Query Types (Non-@media)
# Single-file export — CSS Types + IMeasurement only

```ts
/* =====================================================
   1. Container Queries (@container)
   ===================================================== */

export type CSSContainerType = 'inline-size' | 'size' | 'normal';
export type CSSContainerName = string;

export type CSSContainerSizeFeature =
  | { minWidth: IMeasurement }
  | { maxWidth: IMeasurement }
  | { minHeight: IMeasurement }
  | { maxHeight: IMeasurement }
  | { width: CSSComparison<IMeasurement> }
  | { height: CSSComparison<IMeasurement> }
  | { inlineSize: CSSComparison<IMeasurement> }
  | { blockSize: CSSComparison<IMeasurement> }
  | { widthRange: CSSRange<IMeasurement> }
  | { heightRange: CSSRange<IMeasurement> }
  | { orientation: 'portrait' | 'landscape' };

export type CSSContainerStyleQuery =
  Record<`${string}`, string | number>;

export type CSSContainerCondition =
  | CSSContainerSizeFeature
  | { style: CSSContainerStyleQuery }
  | { and: CSSContainerCondition[] }
  | { or: CSSContainerCondition[] }
  | { not: CSSContainerCondition };

export interface CSSContainerQueryRule {
  container?: {
    type?: CSSContainerType;
    name?: CSSContainerName;
  };
  query?: {
    name?: CSSContainerName;
    condition: CSSContainerCondition;
  };
  styles: CSSTypes.Properties;
}

/* =====================================================
   2. Support Queries (@supports)
   ===================================================== */

export type CSSSupportsDecl = {
  property: keyof CSSTypes.Properties;
  value: string | number;
};

export type CSSSupportsCondition =
  | CSSSupportsDecl
  | { selector: string }
  | { and: CSSSupportsCondition[] }
  | { or: CSSSupportsCondition[] }
  | { not: CSSSupportsCondition };

export interface CSSSupportsRule {
  condition: CSSSupportsCondition;
  styles: CSSTypes.Properties;
}

/* =====================================================
   3. Selector / Relational Queries (:has)
   ===================================================== */

export type CSSSelector = string;

export interface CSSSelectorRule {
  selector: CSSSelector;
  styles: CSSTypes.Properties;
}

/* =====================================================
   4. State Queries (pseudo-classes)
   ===================================================== */

export type CSSStatePseudo =
  | ':hover'
  | ':active'
  | ':focus'
  | ':focus-visible'
  | ':focus-within'
  | ':checked'
  | ':disabled'
  | ':enabled'
  | ':valid'
  | ':invalid'
  | ':required'
  | ':optional'
  | ':target'
  | ':visited'
  | ':link'
  | ':open'
  | ':closed';

export interface CSSStateRule {
  base: CSSSelector;
  state: CSSStatePseudo | `${CSSStatePseudo}${string}`;
  styles: CSSTypes.Properties;
}

/* =====================================================
   5. Environment Queries (env)
   ===================================================== */

export type CSSEnvVar =
  | 'safe-area-inset-top'
  | 'safe-area-inset-right'
  | 'safe-area-inset-bottom'
  | 'safe-area-inset-left';

export type CSSEnvFn =
  `env(${CSSEnvVar}${'' | `, ${string}`})`;

export type CSSValueWithEnv =
  | string
  | number
  | CSSEnvFn
  | IMeasurement;

export type CSSEnvProperties =
  Partial<Record<keyof CSSTypes.Properties, CSSValueWithEnv>>;

/* =====================================================
   6. Paged Media (@page)
   ===================================================== */

export type CSSPagePseudo =
  | ':first'
  | ':left'
  | ':right'
  | ':blank';

export type CSSPageName = string;

export interface CSSPageRule {
  name?: CSSPageName;
  pseudo?: CSSPagePseudo;
  margin?: CSSTypes.Properties;
  page?: CSSTypes.Properties;
}
