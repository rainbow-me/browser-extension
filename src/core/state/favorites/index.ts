import { createBaseStore } from 'stores';
import { Address } from 'viem';

import buildTimeNetworks from 'static/data/networks.json';
import { ChainId } from '~/core/types/chains';
import { normalizeNativeAssetAddress } from '~/core/utils/nativeAssets';

import { createExtensionStoreOptions } from '../_internal';

type UpdateFavoritesArgs = {
  address: Address;
  chainId: ChainId;
};

const INTERNAL_BUILD = process.env.INTERNAL_BUILD === 'true';

const getInitialFavorites = () => {
  return buildTimeNetworks.backendNetworks.networks.reduce(
    (acc, network) => {
      if (network.internal && !INTERNAL_BUILD) return acc;

      return {
        ...acc,
        // Normalize native asset addresses from backend
        [network.id]: network.favorites.map((f) =>
          normalizeNativeAssetAddress(f.address),
        ),
      };
    },
    {} as Record<number, Address[]>,
  );
};

type UpdateFavoritesFn = ({ address, chainId }: UpdateFavoritesArgs) => void;

export interface FavoritesState {
  favorites: Partial<Record<ChainId, Address[]>>;
  setFavorites: (favorites: Partial<Record<ChainId, Address[]>>) => void;
  addFavorite: UpdateFavoritesFn;
  removeFavorite: UpdateFavoritesFn;
}

/**
 * Migrates favorites by normalizing all native asset addresses to NATIVE_ASSET_ADDRESS.
 * This handles 'eth' and '0x0...0' formats from previous versions.
 */
const migrateFavoritesAddresses = (
  favorites: Partial<Record<ChainId, string[]>>,
): Partial<Record<ChainId, Address[]>> => {
  const migrated: Partial<Record<ChainId, Address[]>> = {};
  for (const [chainId, addresses] of Object.entries(favorites)) {
    if (addresses) {
      migrated[Number(chainId) as ChainId] = addresses.map((addr) =>
        normalizeNativeAssetAddress(addr),
      );
    }
  }
  return migrated;
};

export const useFavoritesStore = createBaseStore<FavoritesState>(
  (set, get) => ({
    favorites: getInitialFavorites(),
    setFavorites: (favorites) => set({ favorites }),
    addFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
      const { favorites } = get();
      const currentFavorites = favorites[chainId] || [];
      // Normalize the address before adding
      const normalizedAddress = normalizeNativeAssetAddress(address);
      set({
        favorites: {
          ...favorites,
          [chainId]: [...currentFavorites, normalizedAddress],
        },
      });
    },
    removeFavorite: ({ address, chainId }: UpdateFavoritesArgs) => {
      const { favorites } = get();
      const currentFavorites = favorites[chainId] || [];
      // Normalize for comparison
      const normalizedAddress = normalizeNativeAssetAddress(address);
      set({
        favorites: {
          ...favorites,
          [chainId]: currentFavorites.filter(
            (favoriteAddress) => favoriteAddress !== normalizedAddress,
          ),
        },
      });
    },
  }),
  createExtensionStoreOptions({
    storageKey: 'favorites',
    version: 9,
    migrate(persistedState, version) {
      const state = persistedState as FavoritesState;
      // Version 9: Normalize native asset addresses to NATIVE_ASSET_ADDRESS
      if (version < 9) {
        return {
          ...state,
          favorites: migrateFavoritesAddresses(state.favorites),
        };
      }
      return state;
    },
  }),
);
