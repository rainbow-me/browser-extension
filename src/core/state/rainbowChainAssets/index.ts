import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

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
      version: 0,
    },
  },
);

export const useRainbowChainAssetsStore = create(rainbowChainAssetsStore);
