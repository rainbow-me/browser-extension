import create from 'zustand';

import { AddressOrEth } from '~/core/types/assets';
import { BackendNetwork, ChainId } from '~/core/types/chains';

import { createStore } from '../internal/createStore';
import { networkStore } from '../networks/networks';
import { toChainId } from '../networks/utils';

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

export const mergeNewOfficiallySupportedChainsState = (
  state: FavoritesState,
  newNetworks: Map<string, BackendNetwork>,
) => {
  for (const [key, network] of newNetworks) {
    const chainId = toChainId(key);
    const stateChainFavorites = state.favorites[chainId] || [];
    state.favorites[chainId] = [
      ...new Set(
        stateChainFavorites.concat(
          network.favorites.map((f) => f.address as AddressOrEth),
        ),
      ),
    ];
  }
  return state;
};

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => ({
    favorites: networkStore.getState().getDefaultFavorites(),
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
