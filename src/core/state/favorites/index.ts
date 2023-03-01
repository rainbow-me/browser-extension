import { Address } from 'wagmi';
import create from 'zustand';

import {
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
  OP_ADDRESS,
} from '~/core/references';
import { ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';

type UpdateFavoritesArgs = {
  address: Address;
  chainId: ChainId;
};

type UpdateFavoritesFn = ({ address, chainId }: UpdateFavoritesArgs) => void;

export interface FavoritesState {
  favorites: Record<ChainId, Address[]>;
  addFavorite: UpdateFavoritesFn;
  removeFavorite: UpdateFavoritesFn;
}

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => ({
    favorites: {
      [ChainId.mainnet]: [ETH_ADDRESS as Address],
      [ChainId.arbitrum]: [ETH_ADDRESS as Address],
      [ChainId.bsc]: [BNB_MAINNET_ADDRESS],
      [ChainId.polygon]: [MATIC_MAINNET_ADDRESS],
      [ChainId.optimism]: [OP_ADDRESS],
    },
    addFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
      const { favorites } = get();
      const currentFavorites = favorites?.[chainId] || [];
      set({
        favorites: {
          ...favorites,
          [chainId]: [...currentFavorites, address],
        },
      });
    },
    removeFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
      const { favorites } = get();
      const currentFavorites = favorites?.[chainId] || [];
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
      version: 0,
    },
  },
);

export const useFavoritesStore = create(favoritesStore);
