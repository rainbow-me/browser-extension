import create from 'zustand';

import { analytics } from '~/analytics';
import buildTimeNetworks from 'static/data/networks.json';
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
    // Helper function for tracking analytics
    const trackFavoriteChange = (
      address: AddressOrEth,
      chainId: ChainId,
      isAdding: boolean,
    ) => {
      const updatedState = get();
      const updatedFavorites = updatedState.favorites[chainId] || [];
      const afterLength = updatedFavorites.length;

      const analyticsData = {
        token: {
          address,
          chainId,
        },
        favorites: {
          favoritesLength: afterLength,
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
      set({
        favorites: {
          ...favorites,
          [chainId]: [...currentFavorites, address],
          },
        });

        trackFavoriteChange(address, chainId, true);
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

        trackFavoriteChange(address, chainId, false);
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
