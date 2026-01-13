import { createBaseStore } from '@storesjs/stores';

import { createExtensionStoreOptions } from '../_internal';

export interface ConnectedToHardhatState {
  connectedToHardhat: boolean;
  setConnectedToHardhat: (connectedToHardhat: boolean) => void;

  connectedToHardhatOp: boolean;
  setConnectedToHardhatOp: (connectedToHardhatOp: boolean) => void;
}

export const useConnectedToHardhatStore =
  createBaseStore<ConnectedToHardhatState>(
    (set) => ({
      connectedToHardhat: false,
      setConnectedToHardhat: (connectedToHardhat) => {
        set({ connectedToHardhat });
      },

      connectedToHardhatOp: false,
      setConnectedToHardhatOp: (connectedToHardhatOp) => {
        set({ connectedToHardhatOp });
      },
    }),
    createExtensionStoreOptions({
      storageKey: 'connectedToHardhat',
      version: 0,
    }),
  );
