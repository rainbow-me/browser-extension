import create from 'zustand';

import {
  AVAX_AVALANCHE_ADDRESS,
  BNB_BSC_ADDRESS,
  DAI_ADDRESS,
  DAI_ARBITRUM_ADDRESS,
  DAI_AVALANCHE_ADDRESS,
  DAI_BASE_ADDRESS,
  DAI_BSC_ADDRESS,
  DAI_OPTIMISM_ADDRESS,
  DAI_POLYGON_ADDRESS,
  ETH_ADDRESS,
  ETH_ARBITRUM_ADDRESS,
  ETH_BASE_ADDRESS,
  ETH_BLAST_ADDRESS,
  ETH_DEGEN_ADDRESS,
  ETH_OPTIMISM_ADDRESS,
  ETH_ZORA_ADDRESS,
  MATIC_POLYGON_ADDRESS,
  OP_ADDRESS,
  SOCKS_ADDRESS,
  SOCKS_ARBITRUM_ADDRESS,
  USDB_BLAST_ADDRESS,
  USDC_ADDRESS,
  USDC_ARBITRUM_ADDRESS,
  USDC_AVALANCHE_ADDRESS,
  USDC_BASE_ADDRESS,
  USDC_BSC_ADDRESS,
  USDC_OPTIMISM_ADDRESS,
  USDC_POLYGON_ADDRESS,
  WAVAX_AVALANCHE_ADDRESS,
  WBTC_ADDRESS,
  WBTC_ARBITRUM_ADDRESS,
  WBTC_AVALANCHE_ADDRESS,
  WBTC_OPTIMISM_ADDRESS,
  WBTC_POLYGON_ADDRESS,
  WETH_BASE_ADDRESS,
  WETH_BLAST_ADDRESS,
  WETH_OPTIMISM_ADDRESS,
  WETH_POLYGON_ADDRESS,
  WETH_ZORA_ADDRESS,
} from '~/core/references';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { migrate } from '~/core/utils/migrate';

import { createStore } from '../internal/createStore';

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

const defaultFavorites = {
  [ChainId.mainnet]: [
    ETH_ADDRESS,
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
  [ChainId.bsc]: [BNB_BSC_ADDRESS, DAI_BSC_ADDRESS, USDC_BSC_ADDRESS],
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
  [ChainId.base]: [
    ETH_BASE_ADDRESS,
    WETH_BASE_ADDRESS,
    DAI_BASE_ADDRESS,
    USDC_BASE_ADDRESS,
  ],
  [ChainId.zora]: [ETH_ZORA_ADDRESS, WETH_ZORA_ADDRESS],
  [ChainId.avalanche]: [
    AVAX_AVALANCHE_ADDRESS,
    WAVAX_AVALANCHE_ADDRESS,
    DAI_AVALANCHE_ADDRESS,
    USDC_AVALANCHE_ADDRESS,
    WBTC_AVALANCHE_ADDRESS,
  ],
  [ChainId.blast]: [ETH_BLAST_ADDRESS, WETH_BLAST_ADDRESS, USDB_BLAST_ADDRESS],
  [ChainId.degen]: [ETH_DEGEN_ADDRESS],
} satisfies FavoritesState['favorites'];

const mergeNewOfficiallySupportedChainsState = (
  state: FavoritesState,
  newChains: ChainId[],
) => {
  for (const chainId of newChains) {
    const stateChainFavorites = state.favorites[chainId] || [];
    state.favorites[chainId] = [
      ...new Set(stateChainFavorites.concat(defaultFavorites[chainId])), // Set to remove duplicates if any
    ];
  }
  return state;
};

export const favoritesStore = createStore<FavoritesState>(
  (set, get) => ({
    favorites: defaultFavorites,
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
      version: 4,
      migrate: migrate(
        // version 1 didn't need a migration
        (state: FavoritesState) => state,
        // version 2 added avalanche
        (state) =>
          mergeNewOfficiallySupportedChainsState(state, [ChainId.avalanche]),
        // version 3 added blast
        (state) =>
          mergeNewOfficiallySupportedChainsState(state, [ChainId.blast]),
        // version 4 added degen
        (state) =>
          mergeNewOfficiallySupportedChainsState(state, [ChainId.degen]),
      ),
    },
  },
);

export const useFavoritesStore = create(favoritesStore);
