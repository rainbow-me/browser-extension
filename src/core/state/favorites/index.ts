import { Address } from 'wagmi';
import create from 'zustand';

import {
  DAI_ADDRESS,
  DAI_ARBITRUM_ADDRESS,
  DAI_OPTIMISM_ADDRESS,
  DAI_POLYGON_ADDRESS,
  ETH_ADDRESS,
  ETH_ARBITRUM_ADDRESS,
  ETH_OPTIMISM_ADDRESS,
  MATIC_POLYGON_ADDRESS,
  OP_ADDRESS,
  SOCKS_ADDRESS,
  SOCKS_ARBITRUM_ADDRESS,
  USDC_ADDRESS,
  USDC_ARBITRUM_ADDRESS,
  USDC_OPTIMISM_ADDRESS,
  USDC_POLYGON_ADDRESS,
  WBTC_ADDRESS,
  WBTC_ARBITRUM_ADDRESS,
  WBTC_OPTIMISM_ADDRESS,
  WBTC_POLYGON_ADDRESS,
  WETH_OPTIMISM_ADDRESS,
  WETH_POLYGON_ADDRESS,
} from '~/core/references';
import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

type UpdateFavoritesArgs = {
  address: Address | typeof ETH_ADDRESS;
  chainId: ChainId;
};

type UpdateFavoritesFn = ({ address, chainId }: UpdateFavoritesArgs) => void;

export interface FavoritesState {
  favorites: Record<ChainId, (Address | typeof ETH_ADDRESS)[]>;
  addFavorite: UpdateFavoritesFn;
  removeFavorite: UpdateFavoritesFn;
}

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => ({
    favorites: {
      [ChainId.mainnet]: [
        ETH_ADDRESS as Address,
        DAI_ADDRESS,
        USDC_ADDRESS,
        WBTC_ADDRESS,
        SOCKS_ADDRESS,
      ],
      [ChainId.arbitrum]: [
        ETH_ARBITRUM_ADDRESS,
        DAI_ARBITRUM_ADDRESS,
        USDC_ARBITRUM_ADDRESS,
        WBTC_ARBITRUM_ADDRESS,
        SOCKS_ARBITRUM_ADDRESS,
      ],
      [ChainId.bsc]: [],
      [ChainId.polygon]: [
        MATIC_POLYGON_ADDRESS,
        WETH_POLYGON_ADDRESS,
        DAI_POLYGON_ADDRESS,
        USDC_POLYGON_ADDRESS,
        WBTC_POLYGON_ADDRESS,
      ],
      [ChainId.optimism]: [
        ETH_OPTIMISM_ADDRESS,
        OP_ADDRESS,
        WETH_OPTIMISM_ADDRESS,
        DAI_OPTIMISM_ADDRESS,
        USDC_OPTIMISM_ADDRESS,
        WBTC_OPTIMISM_ADDRESS,
      ],
      [ChainId.hardhat]: [],
    },
    addFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
      const { favorites } = get();
      const currentFavorites = favorites[chainId] || [];
      set({
        favorites: {
          ...favorites,
          [chainId]: [...currentFavorites, address],
        },
      });
    },
    removeFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
      const { favorites } = get();
      const currentFavorites = favorites[chainId] || [];
      set({
        favorites: {
          ...favorites,
          [chainId]: currentFavorites.filter(
            (favoriteAddress) => favoriteAddress !== address,
          ),
        },
      });
    },
  }),
  {
    persist: {
      name: 'favorites',
      version: 1,
    },
  },
);

export const useFavoritesStore = create(favoritesStore);
