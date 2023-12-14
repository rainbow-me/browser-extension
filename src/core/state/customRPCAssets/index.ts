import { Address } from '@wagmi/core';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface CustomRPCAsset {
  name: string;
  address: Address;
  decimals: number;
  symbol: string;
}

export interface CustomRPCAssetsState {
  customRPCAssets: Record<number, CustomRPCAsset[]>;
  addCustomRPCAsset: ({
    chainId,
    customRPCAsset,
  }: {
    chainId: number;
    customRPCAsset: CustomRPCAsset;
  }) => void;
  updateCustomRPCAsset: ({
    chainId,
    customRPCAsset,
  }: {
    chainId: number;
    customRPCAsset: CustomRPCAsset;
  }) => void;
  removeCustomRPCAsset: ({
    chainId,
    address,
  }: {
    chainId: number;
    address: Address;
  }) => void;
}

export const customRPCAssetsStore = createStore<CustomRPCAssetsState>(
  (set, get) => ({
    customRPCAssets: {},
    addCustomRPCAsset: ({ chainId, customRPCAsset }) => {
      const { customRPCAssets } = get();
      const chainIdcustomRPCAsset = customRPCAssets[chainId] || [];
      const newCustomRPCAssets = chainIdcustomRPCAsset.concat([customRPCAsset]);
      set({
        customRPCAssets: {
          ...customRPCAssets,
          [chainId]: newCustomRPCAssets,
        },
      });
    },
    updateCustomRPCAsset: ({ chainId, customRPCAsset }) => {
      const { customRPCAssets } = get();
      const assets = customRPCAssets[chainId] || [];
      const index = assets.findIndex(
        (asset) => asset.address === customRPCAsset.address,
      );
      if (index !== -1) {
        assets[index] = customRPCAsset;
        set({
          customRPCAssets: { ...customRPCAssets, [chainId]: assets },
        });
      }
    },
    removeCustomRPCAsset: ({ chainId, address }) => {
      const { customRPCAssets } = get();
      const assets = customRPCAssets[chainId] || [];
      const updatedAssets = assets.filter((asset) => asset.address !== address);
      if (updatedAssets.length) {
        set({
          customRPCAssets: {
            ...customRPCAssets,
            [chainId]: updatedAssets,
          },
        });
      } else {
        delete customRPCAssets[chainId];
        set({
          customRPCAssets: {
            ...customRPCAssets,
          },
        });
      }
    },
  }),
  {
    persist: {
      name: 'customRPCAssets',
      version: 0,
    },
  },
);

export const useCustomRPCAssetsStore = create(customRPCAssetsStore);
