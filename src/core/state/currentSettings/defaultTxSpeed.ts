import { createBaseStore } from 'stores';

import { GasSpeed } from '~/core/types/gas';
import { DefaultTxSpeedOption } from '~/core/types/settings';

import { createExtensionStoreOptions } from '../_internal';

export interface DefaultTxSpeedState {
  defaultTxSpeed: DefaultTxSpeedOption;
  setDefaultTxSpeed: (defaultTxSpeed: DefaultTxSpeedOption) => void;
}

export const useDefaultTxSpeedStore = createBaseStore<DefaultTxSpeedState>(
  (set) => ({
    defaultTxSpeed: GasSpeed.NORMAL,
    setDefaultTxSpeed: (newDefaultTxSpeed) =>
      set({ defaultTxSpeed: newDefaultTxSpeed }),
  }),
  createExtensionStoreOptions({
    storageKey: 'defaultTxSpeed',
    version: 0,
  }),
);
