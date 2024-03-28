import { type Address } from 'viem';
import create from 'zustand';

import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

const mergeNewOfficiallySupportedChainsAssetState = (
  state: RainbowChainAssetsState,
  newChains: ChainId[],
) => {
  for (const chainId of newChains) {
    const stateChain = state.rainbowChainAssets[chainId];
    // if the rpc already exists in the state, remove all custom tokens
    if (stateChain.length > 0) {
      delete state.rainbowChainAssets[chainId];
    }
  }
  return { ...state };
};

export interface RainbowChainAsset {
  name: string;
  address: Address;
  decimals: number;
  symbol: string;
}

export interface RainbowChainAssetsState {
  rainbowChainAssets: Record<number, RainbowChainAsset[]>;
  addRainbowChainAsset: ({
    chainId,
    rainbowChainAsset,
  }: {
    chainId: number;
    rainbowChainAsset: RainbowChainAsset;
  }) => void;
  updateRainbowChainAsset: ({
    chainId,
    rainbowChainAsset,
  }: {
    chainId: number;
    rainbowChainAsset: RainbowChainAsset;
  }) => void;
  removeRainbowChainAsset: ({
    chainId,
    address,
  }: {
    chainId: number;
    address: Address;
  }) => void;
  removeRainbowChainAssets: ({ chainId }: { chainId: number }) => void;
}

export const rainbowChainAssetsStore = createStore<RainbowChainAssetsState>(
  (set, get) => ({
    rainbowChainAssets: {},
    addRainbowChainAsset: ({ chainId, rainbowChainAsset }) => {
      const { rainbowChainAssets } = get();
      const chainIdcustomRPCAsset = rainbowChainAssets[chainId] || [];
      const newCustomRPCAssets = chainIdcustomRPCAsset.concat([
        rainbowChainAsset,
      ]);
      set({
        rainbowChainAssets: {
          ...rainbowChainAssets,
          [chainId]: newCustomRPCAssets,
        },
      });
    },
    updateRainbowChainAsset: ({ chainId, rainbowChainAsset }) => {
      const { rainbowChainAssets } = get();
      const assets = rainbowChainAssets[chainId] || [];
      const index = assets.findIndex(
        (asset) => asset.address === rainbowChainAsset.address,
      );
      if (index !== -1) {
        assets[index] = rainbowChainAsset;
        set({
          rainbowChainAssets: { ...rainbowChainAssets, [chainId]: assets },
        });
      }
    },
    removeRainbowChainAsset: ({ chainId, address }) => {
      const { rainbowChainAssets } = get();
      const assets = rainbowChainAssets[chainId] || [];
      const updatedAssets = assets.filter((asset) => asset.address !== address);
      if (updatedAssets.length) {
        set({
          rainbowChainAssets: {
            ...rainbowChainAssets,
            [chainId]: updatedAssets,
          },
        });
      } else {
        delete rainbowChainAssets[chainId];
        set({
          rainbowChainAssets: {
            ...rainbowChainAssets,
          },
        });
      }
    },
    removeRainbowChainAssets: ({ chainId }) => {
      const { rainbowChainAssets } = get();
      delete rainbowChainAssets[chainId];
      set({
        rainbowChainAssets: {
          ...rainbowChainAssets,
        },
      });
    },
  }),
  {
    persist: {
      name: 'rainbowChainAssets',
      version: 1,
      migrate(persistedState, version) {
        const state = persistedState as RainbowChainAssetsState;
        if (version === 1) {
          // version 1 added support for Blast
          return mergeNewOfficiallySupportedChainsAssetState(state, [
            ChainId.blast,
          ]);
        }
        return state;
      },
    },
  },
);

export const useRainbowChainAssetsStore = create(rainbowChainAssetsStore);
