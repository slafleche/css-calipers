import type { UnitAssertion, UnitGuard, UnitHelper } from '../core';
import type {
  UnitDefinitionRecord,
  UnitHelperName,
} from '../unitDefinitions';
import { UNIT_DEFINITIONS } from '../unitDefinitions';
import type { CoreApi } from './createCoreApi';

type UnitHelpersMap = {
  [K in UnitHelperName]: UnitHelper<UnitDefinitionRecord[K]['unit']>;
};

export type UnitsApi = UnitHelpersMap & {
  isPercentMeasurement: UnitGuard<UnitHelpersMap['mPercent']>;
  assertPercentMeasurement: UnitAssertion<UnitHelpersMap['mPercent']>;
};

export const createUnitsApi = (core: CoreApi): UnitsApi => {
  const helpers = Object.keys(UNIT_DEFINITIONS).reduce(
    (acc, name) => {
      const helperName = name as UnitHelperName;
      acc[helperName] = core.makeUnitHelperFromDefinition(helperName);
      return acc;
    },
    {} as Record<UnitHelperName, UnitHelper<string>>,
  ) as UnitHelpersMap;

  const mPercent = helpers.mPercent;

  return {
    ...helpers,
    isPercentMeasurement: core.makeUnitGuard(mPercent),
    assertPercentMeasurement: core.makeUnitAssert(mPercent),
  };
};
