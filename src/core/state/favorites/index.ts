import create from 'zustand';

import { createStore } from '~/core/state/internal/createStore';
import { networkStore } from '~/core/state/networks/networks';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

type UpdateFavoritesArgs = {
  address: AddressOrEth;
  chainId: ChainId;
};

type UpdateFavoritesFn = ({ address, chainId }: UpdateFavoritesArgs) => void;

export interface FavoritesState {
  favorites: Partial<Record<ChainId, AddressOrEth[]>>;
  setFavorites: (favorites: Partial<Record<ChainId, AddressOrEth[]>>) => void;
  addFavorite: UpdateFavoritesFn;
  removeFavorite: UpdateFavoritesFn;
}

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => ({
    favorites: networkStore.getState().getDefaultFavorites(),
    setFavorites: (favorites) => set({ favorites }),
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
      version: 7,
    },
  },
);

export const useFavoritesStore = create(favoritesStore);
