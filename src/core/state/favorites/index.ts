import create from 'zustand';

import { analytics } from '~/analytics';
import {
  APEETH_APECHAIN_ADDRESS,
  APEUSD_APECHAIN_ADDRESS,
  APE_APECHAIN_ADDRESS,
  AVAX_AVALANCHE_ADDRESS,
  BERA_BERACHAIN_ADDRESS,
  BNB_BSC_ADDRESS,
  DAI_ADDRESS,
  DAI_ARBITRUM_ADDRESS,
  DAI_AVALANCHE_ADDRESS,
  DAI_BASE_ADDRESS,
  DAI_BSC_ADDRESS,
  DAI_OPTIMISM_ADDRESS,
  DAI_POLYGON_ADDRESS,
  DEGEN_DEGEN_ADDRESS,
  DMT_SANKO_ADDRESS,
  ETH_ADDRESS,
  ETH_ARBITRUM_ADDRESS,
  ETH_BASE_ADDRESS,
  ETH_BLAST_ADDRESS,
  ETH_INK_ADDRESS,
  ETH_OPTIMISM_ADDRESS,
  ETH_ZORA_ADDRESS,
  G_GRAVITY_ADDRESS,
  OP_ADDRESS,
  POL_POLYGON_ADDRESS,
  SOCKS_ADDRESS,
  SOCKS_ARBITRUM_ADDRESS,
  USDB_BLAST_ADDRESS,
  USDC_ADDRESS,
  USDC_ARBITRUM_ADDRESS,
  USDC_AVALANCHE_ADDRESS,
  USDC_BASE_ADDRESS,
  USDC_BSC_ADDRESS,
  USDC_GRAVITY_ADDRESS,
  USDC_OPTIMISM_ADDRESS,
  USDC_POLYGON_ADDRESS,
  USDC_SANKO_ADDRESS,
  USDE_BERACHAIN_ADDRESS,
  WAPE_APECHAIN_ADDRESS,
  WAVAX_AVALANCHE_ADDRESS,
  WBERA_BERACHAIN_ADDRESS,
  WBTC_ADDRESS,
  WBTC_ARBITRUM_ADDRESS,
  WBTC_AVALANCHE_ADDRESS,
  WBTC_GRAVITY_ADDRESS,
  WBTC_OPTIMISM_ADDRESS,
  WBTC_POLYGON_ADDRESS,
  WDMT_SANKO_ADDRESS,
  WETH_BASE_ADDRESS,
  WETH_BLAST_ADDRESS,
  WETH_GRAVITY_ADDRESS,
  WETH_INK_ADDRESS,
  WETH_OPTIMISM_ADDRESS,
  WETH_POLYGON_ADDRESS,
  WETH_SANKO_ADDRESS,
  WETH_ZORA_ADDRESS,
  WG_GRAVITY_ADDRESS,
  WeETH_BERACHAIN_ADDRESS,
} from '~/core/references';
import { AddressOrEth } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { persistOptions } from '~/core/utils/persistOptions';

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
    POL_POLYGON_ADDRESS,
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
  [ChainId.degen]: [DEGEN_DEGEN_ADDRESS],
  [ChainId.apechain]: [
    APE_APECHAIN_ADDRESS,
    WAPE_APECHAIN_ADDRESS,
    APEETH_APECHAIN_ADDRESS,
    APEUSD_APECHAIN_ADDRESS,
  ],
  [ChainId.ink]: [ETH_INK_ADDRESS, WETH_INK_ADDRESS],
  [ChainId.sanko]: [
    DMT_SANKO_ADDRESS,
    WDMT_SANKO_ADDRESS,
    USDC_SANKO_ADDRESS,
    WETH_SANKO_ADDRESS,
  ],
  [ChainId.gravity]: [
    G_GRAVITY_ADDRESS,
    WG_GRAVITY_ADDRESS,
    WETH_GRAVITY_ADDRESS,
    USDC_GRAVITY_ADDRESS,
    WBTC_GRAVITY_ADDRESS,
  ],
  [ChainId.berachain]: [
    BERA_BERACHAIN_ADDRESS,
    WBERA_BERACHAIN_ADDRESS,
    USDE_BERACHAIN_ADDRESS,
    WeETH_BERACHAIN_ADDRESS,
  ],
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
    persist: persistOptions({
      name: 'favorites',
      version: 7,
      migrations: [
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
        // version 5 added apechain
        (state) =>
          mergeNewOfficiallySupportedChainsState(state, [ChainId.apechain]),
        // version 6 added ink
        (state) => mergeNewOfficiallySupportedChainsState(state, [ChainId.ink]),
        // version 7 added sanko & gravity
        (state) =>
          mergeNewOfficiallySupportedChainsState(state, [
            ChainId.sanko,
            ChainId.gravity,
          ]),
      ],
    }),
  },
);

export const useFavoritesStore = create(favoritesStore);
