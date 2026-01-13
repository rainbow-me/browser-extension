import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';

import { createExtensionStoreOptions } from '../_internal';

type NonceData = {
  currentNonce?: number;
  latestConfirmedNonce?: number;
};

type GetNonceArgs = {
  address: Address;
  chainId: ChainId;
};

type UpdateNonceArgs = NonceData & GetNonceArgs;

export interface CurrentNonceState {
  nonces: Record<Address, Record<ChainId, NonceData>>;
  setNonce: ({
    address,
    currentNonce,
    latestConfirmedNonce,
    chainId,
  }: UpdateNonceArgs) => void;
  getNonce: ({ address, chainId }: GetNonceArgs) => NonceData | null;
  clearNonces: () => void;
}

export const useNonceStore = createBaseStore<CurrentNonceState>(
  (set, get) => ({
    nonces: {},
    setNonce: ({ address, currentNonce, latestConfirmedNonce, chainId }) => {
      set((state) => {
        const addressAndChainIdNonces = state.nonces[address]?.[chainId] || {};
        return {
          nonces: {
            ...state.nonces,
            [address]: {
              ...state.nonces[address],
              [chainId]: {
                currentNonce:
                  currentNonce ?? addressAndChainIdNonces?.currentNonce,
                latestConfirmedNonce:
                  latestConfirmedNonce ??
                  addressAndChainIdNonces?.latestConfirmedNonce,
              },
            },
          },
        };
      });
    },
    getNonce: ({ address, chainId }) => {
      const { nonces } = get();
      return nonces[address]?.[chainId] ?? null;
    },
    clearNonces: () => {
      set({ nonces: {} });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'nonce',
    version: 0,
  }),
);
