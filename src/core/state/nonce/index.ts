import { Address, Chain } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

type NonceData = {
  currentNonce?: number;
  latestConfirmedNonce?: number;
};

type GetNonceArgs = {
  address?: Address;
  network?: Chain['id'];
};

type UpdateNonceArgs = NonceData & GetNonceArgs;

export interface CurrentNonceState {
  [key: Address]: {
    [key: Chain['id']]: NonceData;
  };
  setNonce: ({
    address,
    currentNonce,
    latestConfirmedNonce,
    network,
  }: UpdateNonceArgs) => void;
  getNonce: ({ address, network }: GetNonceArgs) => NonceData | null;
}

export const nonceStore = createStore<CurrentNonceState>(
  (set, get) => ({
    setNonce: ({ address, currentNonce, latestConfirmedNonce, network }) => {
      if (address && network) {
        const staleData = get()?.[address]?.[network];
        set({
          [address]: {
            [network]: {
              currentNonce: currentNonce ?? staleData?.currentNonce,
              latestConfirmedNonce:
                latestConfirmedNonce ?? staleData?.latestConfirmedNonce,
            },
          },
        });
      }
    },
    getNonce: ({ address, network }) => {
      if (address && network) {
        return get()?.[address]?.[network] ?? null;
      }
      return null;
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
