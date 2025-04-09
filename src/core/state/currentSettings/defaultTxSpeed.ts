import { GasSpeed } from '~/core/types/gas';
import { DefaultTxSpeedOption } from '~/core/types/settings';

import { createRainbowStore } from '../internal/createRainbowStore';

export interface DefaultTxSpeedState {
  defaultTxSpeed: DefaultTxSpeedOption;
  setDefaultTxSpeed: (defaultTxSpeed: DefaultTxSpeedOption) => void;
}

export const useDefaultTxSpeedStore = createRainbowStore<DefaultTxSpeedState>(
  (set) => ({
    defaultTxSpeed: GasSpeed.NORMAL,
    setDefaultTxSpeed: (newDefaultTxSpeed) =>
      set({ defaultTxSpeed: newDefaultTxSpeed }),
  }),
  {
    storageKey: 'defaultTxSpeed',
    version: 0,
  },
);
