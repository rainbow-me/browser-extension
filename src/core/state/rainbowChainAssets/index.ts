import { Address } from 'viem';

import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { ChainId } from '~/core/types/chains';

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
  createRainbowStore<RainbowChainAssetsState>(
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
        const updatedAssets = assets.filter(
          (asset) => asset.address !== address,
        );
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
    },
  );
