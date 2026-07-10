import { DEFAULT_HARDENING, type Hardening } from './hardening';
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
  /**
   * How `m` reacts when arithmetic breaks a carried hardened bound:
   * `'ignore' | 'warn' | 'fail'` (default `'fail'`). The shared `Hardening`
   * type; also settable via the corpus / compendium bundle `global`.
   */
  hardening?: Hardening;
};

export type CalipersInstance = CoreApi &
  UnitsApi & {
    units: UnitsApi;
  };

export const createCalipers = (
  config: CalipersFactoryConfig = {},
): CalipersInstance => {
  const errorStore = createErrorConfigStore(config.errorConfig ?? {});
  const core = createCoreApi(
    errorStore,
    config.hardening ?? DEFAULT_HARDENING,
  );
  const units = createUnitsApi(core);

  return {
    ...core,
    ...units,
    units,
  };
};
