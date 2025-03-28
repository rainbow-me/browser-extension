import create from 'zustand';

import buildTimeNetworks from 'static/data/networks.json';
import { analytics } from '~/analytics';
import { createStore } from '~/core/state/internal/createStore';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

type UpdateFavoritesArgs = {
  address: AddressOrEth;
  chainId: ChainId;
};

const IS_DEV = process.env.IS_DEV === 'true';
const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

const getInitialFavorites = () => {
  return buildTimeNetworks.backendNetworks.networks.reduce(
    (acc, network) => {
      if (network.internal && !(INTERNAL_BUILD || IS_DEV)) return acc;

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

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => {
    const trackFavoriteChange = (
      address: AddressOrEth,
      chainId: ChainId,
      isAdding: boolean,
      favoritesLength: number,
    ) => {
      const analyticsData = {
        token: {
          address,
          chainId,
        },
        favorites: {
          favoritesLength,
        },
      };

      const eventType = isAdding
        ? analytics.event.tokenFavorited
        : analytics.event.tokenUnfavorited;

      analytics.track(eventType, analyticsData);
    };

    return {
      favorites: getInitialFavorites(),
      setFavorites: (favorites) => set({ favorites }),
      addFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
        const { favorites } = get();
        const currentFavorites = favorites[chainId] || [];
        const updatedFavorites = [...currentFavorites, address];
        set({
          favorites: {
            ...favorites,
            [chainId]: updatedFavorites,
          },
        });

        trackFavoriteChange(address, chainId, true, updatedFavorites.length);
      },

      removeFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
        const { favorites } = get();
        const currentFavorites = favorites[chainId] || [];
        const updatedFavorites = currentFavorites.filter(
          (favoriteAddress) => favoriteAddress !== address,
        );

        set({
          favorites: {
            ...favorites,
            [chainId]: updatedFavorites,
          },
        });

        trackFavoriteChange(address, chainId, false, updatedFavorites.length);
      },
    };
  },
  {
    persist: {
      name: 'favorites',
      version: 8,
    },
  },
);

export const useFavoritesStore = create(favoritesStore);
