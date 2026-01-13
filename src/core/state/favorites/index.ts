import { createBaseStore } from '@storesjs/stores';

import buildTimeNetworks from 'static/data/networks.json';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

import { createExtensionStoreOptions } from '../_internal';

type UpdateFavoritesArgs = {
  address: AddressOrEth;
  chainId: ChainId;
};

const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

const getInitialFavorites = () => {
  return buildTimeNetworks.backendNetworks.networks.reduce(
    (acc, network) => {
      if (network.internal && !INTERNAL_BUILD) return acc;

      return {
        ...acc,
        [network.id]: network.favorites.map((f) => f.address as AddressOrEth),
      };
    },
    {} as Record<number, AddressOrEth[]>,
  );
};

type UpdateFavoritesFn = ({ address, chainId }: UpdateFavoritesArgs) => void;

export interface FavoritesState {
  favorites: Partial<Record<ChainId, AddressOrEth[]>>;
  setFavorites: (favorites: Partial<Record<ChainId, AddressOrEth[]>>) => void;
  addFavorite: UpdateFavoritesFn;
  removeFavorite: UpdateFavoritesFn;
}

export const useFavoritesStore = createBaseStore<FavoritesState>(
  (set, get) => ({
    favorites: getInitialFavorites(),
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
  createExtensionStoreOptions({
    storageKey: 'favorites',
    version: 8,
  }),
);
