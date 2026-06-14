import {
  type CoreApi,
  createCoreApi,
} from './internal/createCoreApi';
import {
  createUnitsApi,
  type UnitsApi,
} from './internal/createUnitsApi';
import {
  createErrorConfigStore,
  type ErrorConfig,
} from './internal/errors';

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
  const errorStore = createErrorConfigStore(config.errorConfig ?? {});
  const core = createCoreApi(errorStore);
  const units = createUnitsApi(core);

  return {
    ...core,
    ...units,
    units,
  };
};
