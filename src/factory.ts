import { createErrorConfigStore, type ErrorConfig } from './internal/errors';
import { createCoreApi, type CoreApi } from './internal/createCoreApi';
import { createUnitsApi, type UnitsApi } from './internal/createUnitsApi';

export type CalipersFactoryConfig = {
  errorConfig?: ErrorConfig;
};

export type CalipersInstance = CoreApi &
  UnitsApi & {
    units: UnitsApi;
  };

export const createCalipers = (
  config: CalipersFactoryConfig = {},
): CalipersInstance => {
  const errorStore = createErrorConfigStore(
    config.errorConfig ?? {},
  );
  const core = createCoreApi(errorStore);
  const units = createUnitsApi(core);

  return {
    ...core,
    ...units,
    units,
  };
};
