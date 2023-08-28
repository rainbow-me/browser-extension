import { Address } from 'wagmi';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

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
  [key: Address]: Partial<Record<ChainId, NonceData>>;
  setNonce: ({
    address,
    currentNonce,
    latestConfirmedNonce,
    chainId,
  }: UpdateNonceArgs) => void;
  getNonce: ({ address, chainId }: GetNonceArgs) => NonceData | null;
}

export const nonceStore = createStore<CurrentNonceState>(
  (set, get) => ({
    setNonce: ({ address, currentNonce, latestConfirmedNonce, chainId }) => {
      const staleData = get()?.[address]?.[chainId];
      set({
        [address]: {
          [chainId]: {
            currentNonce: currentNonce ?? staleData?.currentNonce,
            latestConfirmedNonce:
              latestConfirmedNonce ?? staleData?.latestConfirmedNonce,
          },
        },
      });
    },
    getNonce: ({ address, chainId }) => {
      return get()?.[address]?.[chainId] ?? null;
    },
  }),
  {
    persist: {
      name: 'currentNonce',
      version: 0,
    },
  },
);

export const useNonceStore = create(nonceStore);
