import type { AtRule, Properties } from "csstype";
import type {
  ClassNames,
  CSSVarFunction,
  WithQuery,
} from "../types";

type CSSTypeProperties = Properties<number | (string & {})>;

export type CSSProperties = {
  [Property in keyof CSSTypeProperties]:
    | CSSTypeProperties[Property]
    | CSSVarFunction
    | Array<CSSVarFunction | CSSTypeProperties[Property]>;
};

export interface CSSKeyframes {
  [time: string]: CSSPropertiesWithVars;
}

export type CSSPropertiesWithVars = CSSProperties & {
  vars?: {
    [key: string]: string;
  };
};

export type SimplePseudo = `:${string}` | `::${string}`;

type PseudoProperties = {
  [key in SimplePseudo]?: CSSPropertiesWithVars;
};

type CSSPropertiesAndPseudos = CSSPropertiesWithVars & PseudoProperties;

export interface SelectorMap {
  [selector: string]: WithQuery<CSSPropertiesWithVars>;
}

export interface StyleWithSelectors extends CSSPropertiesAndPseudos {
  selectors?: SelectorMap;
}

export type StyleRule = WithQuery<StyleWithSelectors>;

export type GlobalStyleRule = WithQuery<CSSPropertiesWithVars>;

export type GlobalFontFaceRule = Omit<AtRule.FontFaceFallback, "src"> &
  Required<Pick<AtRule.FontFaceFallback, "src">>;
export type FontFaceRule = Omit<GlobalFontFaceRule, "fontFamily">;

export type CSSStyleBlock = {
  type: "local";
  selector: string;
  rule: StyleRule;
};

export type CSSFontFaceBlock = {
  type: "fontFace";
  rule: GlobalFontFaceRule;
};

export type CSSKeyframesBlock = {
  type: "keyframes";
  name: string;
  rule: CSSKeyframes;
};

export type CSSSelectorBlock = {
  type: "selector" | "global";
  selector: string;
  rule: GlobalStyleRule;
};

export type CSSLayerDeclaration = {
  type: "layer";
  name: string;
};

export type CSSPropertyBlock = {
  type: "property";
  name: string;
  rule: AtRule.Property;
};

export type CSS =
  | CSSStyleBlock
  | CSSFontFaceBlock
  | CSSKeyframesBlock
  | CSSSelectorBlock
  | CSSLayerDeclaration
  | CSSPropertyBlock;

export type FileScope = {
  packageName?: string;
  filePath: string;
};

export interface Composition {
  identifier: string;
  classList: string;
}

type CustomIdentFunction = (params: {
  hash: string;
  filePath: string;
  debugId?: string;
  packageName?: string;
}) => string;

type IdentOption = "short" | "debug" | CustomIdentFunction;

export interface Adapter {
  appendCss: (css: CSS, fileScope: FileScope) => void;
  registerClassName: (className: string, fileScope: FileScope) => void;
  registerComposition: (composition: Composition, fileScope: FileScope) => void;
  markCompositionUsed: (identifier: string) => void;
  onBeginFileScope?: (fileScope: FileScope) => void;
  onEndFileScope: (fileScope: FileScope) => void;
  getIdentOption: () => IdentOption;
}

export type ComplexStyleRule = StyleRule | Array<StyleRule | ClassNames>;

export type {
  QueryAll,
  ClassNames,
  QueryContainer,
  CSSVarFunction,
  QueryFeature,
  QueryLayer,
  MapLeafNodes,
  NullableTokens,
  PropertySyntax,
  QueryMedia,
  QueryRule,
  Resolve,
  QueryStartingStyle,
  ThemeVars,
  Tokens,
  WithQuery,
} from "../types";
