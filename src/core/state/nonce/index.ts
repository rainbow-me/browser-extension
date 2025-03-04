import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';
import { withSelectors } from '../internal/withSelectors';

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

export const nonceStore = createStore<CurrentNonceState>(
  (set, get) => ({
    nonces: {},
    setNonce: ({ address, currentNonce, latestConfirmedNonce, chainId }) => {
      const { nonces: oldNonces } = get();
      const addressAndChainIdNonces = oldNonces?.[address]?.[chainId] || {};
      set({
        nonces: {
          ...oldNonces,
          [address]: {
            ...oldNonces[address],
            [chainId]: {
              currentNonce:
                currentNonce ?? addressAndChainIdNonces?.currentNonce,
              latestConfirmedNonce:
                latestConfirmedNonce ??
                addressAndChainIdNonces?.latestConfirmedNonce,
            },
          },
        },
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
  {
    persist: {
      name: 'nonce',
      version: 0,
    },
  },
);

export const useNonceStore = withSelectors(nonceStore);
