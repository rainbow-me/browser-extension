import create from 'zustand';

import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { createStore } from '../internal/createStore';
import { useBackendNetworksStore } from '../backendNetworks/backendNetworks';

type UpdateFavoritesArgs = {
  address: AddressOrEth;
  chainId: ChainId;
};

type UpdateFavoritesFn = ({ address, chainId }: UpdateFavoritesArgs) => void;

export interface FavoritesState {
  favorites: Partial<Record<ChainId, AddressOrEth[]>>;
  addFavorite: UpdateFavoritesFn;
  removeFavorite: UpdateFavoritesFn;
}

const getDefaultFavoritesForChains = () => {
  return useBackendNetworksStore.getState().getChainsFavorites();
};

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => ({
    favorites: getDefaultFavoritesForChains(),
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
      version: 6, 
    },
  },
);

export const useFavoritesStore = create(favoritesStore);
