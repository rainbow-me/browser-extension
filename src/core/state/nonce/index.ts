import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { ChainId } from '~/core/types/chains';

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

export const useNonceStore = createRainbowStore<CurrentNonceState>(
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
    storageKey: 'nonce',
    version: 0,
  },
);
