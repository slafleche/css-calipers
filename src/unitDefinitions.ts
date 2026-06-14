export type UnitCategory =
  | 'percent'
  | 'length-absolute'
  | 'length-font-relative'
  | 'length-viewport'
  | 'length-viewport-small'
  | 'length-viewport-large'
  | 'length-viewport-dynamic'
  | 'length-container'
  | 'angle'
  | 'time'
  | 'frequency'
  | 'resolution'
  | 'flex';

export type UnitDefinition = {
  unit: string;
  category: UnitCategory;
  description?: string;
};

export const UNIT_DEFINITIONS = {
  mPercent: { unit: '%', category: 'percent' },

  mPx: { unit: 'px', category: 'length-absolute' },
  mCm: { unit: 'cm', category: 'length-absolute' },
  mMm: { unit: 'mm', category: 'length-absolute' },
  mQ: { unit: 'q', category: 'length-absolute' },
  mIn: { unit: 'in', category: 'length-absolute' },
  mPc: { unit: 'pc', category: 'length-absolute' },
  mPt: { unit: 'pt', category: 'length-absolute' },

  mEm: { unit: 'em', category: 'length-font-relative' },
  mRem: { unit: 'rem', category: 'length-font-relative' },
  mEx: { unit: 'ex', category: 'length-font-relative' },
  mRex: { unit: 'rex', category: 'length-font-relative' },
  mCh: { unit: 'ch', category: 'length-font-relative' },
  mRch: { unit: 'rch', category: 'length-font-relative' },
  mCap: { unit: 'cap', category: 'length-font-relative' },
  mRcap: { unit: 'rcap', category: 'length-font-relative' },
  mIc: { unit: 'ic', category: 'length-font-relative' },
  mRic: { unit: 'ric', category: 'length-font-relative' },
  mLh: { unit: 'lh', category: 'length-font-relative' },
  mRlh: { unit: 'rlh', category: 'length-font-relative' },

  mVw: { unit: 'vw', category: 'length-viewport' },
  mVh: { unit: 'vh', category: 'length-viewport' },
  mVi: { unit: 'vi', category: 'length-viewport' },
  mVb: { unit: 'vb', category: 'length-viewport' },
  mVmin: { unit: 'vmin', category: 'length-viewport' },
  mVmax: { unit: 'vmax', category: 'length-viewport' },

  mSvw: { unit: 'svw', category: 'length-viewport-small' },
  mSvh: { unit: 'svh', category: 'length-viewport-small' },
  mSvi: { unit: 'svi', category: 'length-viewport-small' },
  mSvb: { unit: 'svb', category: 'length-viewport-small' },
  mSvmin: { unit: 'svmin', category: 'length-viewport-small' },
  mSvmax: { unit: 'svmax', category: 'length-viewport-small' },

  mLvw: { unit: 'lvw', category: 'length-viewport-large' },
  mLvh: { unit: 'lvh', category: 'length-viewport-large' },
  mLvi: { unit: 'lvi', category: 'length-viewport-large' },
  mLvb: { unit: 'lvb', category: 'length-viewport-large' },
  mLvmin: { unit: 'lvmin', category: 'length-viewport-large' },
  mLvmax: { unit: 'lvmax', category: 'length-viewport-large' },

  mDvw: { unit: 'dvw', category: 'length-viewport-dynamic' },
  mDvh: { unit: 'dvh', category: 'length-viewport-dynamic' },
  mDvi: { unit: 'dvi', category: 'length-viewport-dynamic' },
  mDvb: { unit: 'dvb', category: 'length-viewport-dynamic' },
  mDvmin: { unit: 'dvmin', category: 'length-viewport-dynamic' },
  mDvmax: { unit: 'dvmax', category: 'length-viewport-dynamic' },

  mCqw: { unit: 'cqw', category: 'length-container' },
  mCqh: { unit: 'cqh', category: 'length-container' },
  mCqi: { unit: 'cqi', category: 'length-container' },
  mCqb: { unit: 'cqb', category: 'length-container' },
  mCqmin: { unit: 'cqmin', category: 'length-container' },
  mCqmax: { unit: 'cqmax', category: 'length-container' },

  mDeg: { unit: 'deg', category: 'angle' },
  mRad: { unit: 'rad', category: 'angle' },
  mGrad: { unit: 'grad', category: 'angle' },
  mTurn: { unit: 'turn', category: 'angle' },

  mS: { unit: 's', category: 'time' },
  mMs: { unit: 'ms', category: 'time' },

  mHz: { unit: 'hz', category: 'frequency' },
  mKhz: { unit: 'khz', category: 'frequency' },

  mDpi: { unit: 'dpi', category: 'resolution' },
  mDpcm: { unit: 'dpcm', category: 'resolution' },
  mDppx: { unit: 'dppx', category: 'resolution' },

  mFr: { unit: 'fr', category: 'flex' },
} as const satisfies Record<string, UnitDefinition>;

export type UnitDefinitionRecord = typeof UNIT_DEFINITIONS;
export type UnitHelperName = keyof UnitDefinitionRecord;
