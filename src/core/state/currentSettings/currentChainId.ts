import { createBaseStore } from '@storesjs/stores';

import { ChainId } from '~/core/types/chains';

import { createExtensionStoreOptions } from '../_internal';

export interface CurrentChainIdState {
  currentChainId: number;
  setCurrentChainId: (chainId: number) => void;
}

export const useCurrentChainIdStore = createBaseStore<CurrentChainIdState>(
  (set) => ({
    currentChainId: ChainId.mainnet,
    setCurrentChainId: (newChainId) => set({ currentChainId: newChainId }),
  }),
  createExtensionStoreOptions({
    storageKey: 'currentChainId',
    version: 0,
  }),
);
