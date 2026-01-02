export type Resolve<T> = {
  [Key in keyof T]: T[Key];
} & {};

export type CSSVarFunction = string;

export type MapLeafNodes<T, Leaf> = T extends null
  ? null
  : T extends string
  ? Leaf
  : T extends object
  ? { [Key in keyof T]: MapLeafNodes<T[Key], Leaf> }
  : Leaf;

export type NullableTokens = {
  [key: string]: string | NullableTokens | null;
};

export type Tokens = {
  [key: string]: string | Tokens;
};

export type ThemeVars<ThemeContract extends NullableTokens> = MapLeafNodes<
  ThemeContract,
  CSSVarFunction
>;

export type ClassNames = string | Array<ClassNames>;

type _PropertySyntax =
  | "<angle>"
  | "<color>"
  | "<custom-ident>"
  | "<image>"
  | "<integer>"
  | "<length-percentage>"
  | "<length>"
  | "<number>"
  | "<percentage>"
  | "<resolution>"
  | "<string>"
  | "<time>"
  | "<transform-function>"
  | "<transform-list>"
  | "<url>"
  | "*";

type LooseAutocomplete<Suggestions extends string> =
  | Suggestions
  | Omit<string, Suggestions>;

export type PropertySyntax = LooseAutocomplete<_PropertySyntax>;

export type QueryRule<Key extends string, StyleType> = {
  [key in Key]?: {
    [query: string]: Omit<StyleType, Key>;
  };
};

export type QueryMedia<StyleType> = QueryRule<"@media", StyleType>;
export type QueryFeature<StyleType> = QueryRule<"@supports", StyleType>;
export type QueryContainer<StyleType> = QueryRule<"@container", StyleType>;
export type QueryLayer<StyleType> = QueryRule<"@layer", StyleType>;
export type QueryStartingStyle<StyleType> = {
  "@starting-style"?: Omit<StyleType, "@starting-style">;
};

export interface QueryAll<StyleType>
  extends QueryMedia<StyleType & QueryAll<StyleType>>,
    QueryFeature<StyleType & QueryAll<StyleType>>,
    QueryContainer<StyleType & QueryAll<StyleType>>,
    QueryLayer<StyleType & QueryAll<StyleType>>,
    QueryStartingStyle<StyleType> {}

export type WithQuery<StyleType> = StyleType & QueryAll<StyleType>;
