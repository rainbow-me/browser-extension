import { createBaseStore } from '@storesjs/stores';
import { Address } from 'viem';

import { ChainId } from '~/core/types/chains';

import { createExtensionStoreOptions } from '../_internal';

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

export const useRainbowChainAssetsStore =
  createBaseStore<RainbowChainAssetsState>(
    (set) => ({
      rainbowChainAssets: {},
      addRainbowChainAsset: ({ chainId, rainbowChainAsset }) => {
        set((state) => {
          const chainIdcustomRPCAsset = state.rainbowChainAssets[chainId] || [];
          const newCustomRPCAssets = chainIdcustomRPCAsset.concat([
            rainbowChainAsset,
          ]);
          return {
            rainbowChainAssets: {
              ...state.rainbowChainAssets,
              [chainId]: newCustomRPCAssets,
            },
          };
        });
      },
      updateRainbowChainAsset: ({ chainId, rainbowChainAsset }) => {
        set((state) => {
          const assets = state.rainbowChainAssets[chainId] || [];
          const index = assets.findIndex(
            (asset) => asset.address === rainbowChainAsset.address,
          );
          if (index !== -1) {
            const updatedAssets = [...assets];
            updatedAssets[index] = rainbowChainAsset;
            return {
              rainbowChainAssets: {
                ...state.rainbowChainAssets,
                [chainId]: updatedAssets,
              },
            };
          }
          return state;
        });
      },
      removeRainbowChainAsset: ({ chainId, address }) => {
        set((state) => {
          const assets = state.rainbowChainAssets[chainId] || [];
          const updatedAssets = assets.filter(
            (asset) => asset.address !== address,
          );
          if (updatedAssets.length) {
            return {
              rainbowChainAssets: {
                ...state.rainbowChainAssets,
                [chainId]: updatedAssets,
              },
            };
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [chainId]: _chainId, ...rest } = state.rainbowChainAssets;
            return {
              rainbowChainAssets: rest,
            };
          }
        });
      },
      removeRainbowChainAssets: ({ chainId }) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [chainId]: _chainId, ...rest } = state.rainbowChainAssets;
          return {
            rainbowChainAssets: rest,
          };
        });
      },
    }),
    createExtensionStoreOptions({
      storageKey: 'rainbowChainAssets',
      version: 2,
      migrate(persistedState, version) {
        const state = persistedState as RainbowChainAssetsState;
        if (version === 0) {
          // version 1 added support for Blast
          const version1State = mergeNewOfficiallySupportedChainsAssetState(
            state,
            [ChainId.blast],
          );
          // version 2 added support for Degen
          return mergeNewOfficiallySupportedChainsAssetState(version1State, [
            ChainId.degen,
          ]);
        } else if (version === 1) {
          // version 2 added support for Degen
          return mergeNewOfficiallySupportedChainsAssetState(state, [
            ChainId.degen,
          ]);
        }
        return state;
      },
    }),
  );
