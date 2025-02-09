import qs from 'qs';

import { tokenSearchHttp } from '~/core/network/tokenSearch';
import { ChainId } from '~/core/types/chains';
import {
  SearchAsset,
  TokenSearchAssetKey,
} from '~/core/types/search';

import { parseTokenSearchResults } from './parseTokenSearch';
import { logger, RainbowError } from '~/logger';
import { createRainbowStore } from '~/core/state/internal/createRainbowStore';
import { createQueryStore } from '~/core/state/internal/createQueryStore';
import { AddressOrEth } from '~/core/types/assets';

type TokenSearchParams = {
  list?: string;
  chainId: ChainId;
  query: string | undefined;
  inputAssetBridgeAssetAddress: AddressOrEth | undefined;
  inputAssetChainId: ChainId | undefined;
};

type TokenSearchState = {
  bridgeAsset: SearchAsset | null;
};

type SearchQueryState = {
  searchQuery: string;
};

type VerifiedTokenData = {
  bridgeAsset: SearchAsset | null;
  crosschainResults: SearchAsset[];
  verifiedAssets: SearchAsset[];
  unverifiedAssets: SearchAsset[];
};

enum TokenLists {
  HighLiquidity = 'highLiquidityAssets',
  LowLiquidity = 'lowLiquidityAssets',
  Verified = 'verifiedAssets',
}

const MAX_VERIFIED_RESULTS = 24;
const MAX_UNVERIFIED_RESULTS = 6;
const MAX_CROSSCHAIN_RESULTS = 3;

const fiftenSeconds = 15_000;
const oneHour = 3_600_000;
const twoMinutes = 120_000;

const NO_RESULTS: VerifiedTokenData = { bridgeAsset: null, crosschainResults: [], verifiedAssets: [], unverifiedAssets: [] };

export const useSwapsSearchStore = createRainbowStore<SearchQueryState>(() => ({ searchQuery: '' }));
export const useTokenSearchStore = createQueryStore<VerifiedTokenData, TokenSearchParams, TokenSearchState>(
  {
    fetcher: (params, abortController) => tokenSearchQueryFunction(params, abortController),
    cacheTime: params => (params.query?.length ? fiftenSeconds : oneHour),
    disableAutoRefetching: true,
    keepPreviousData: true,
    staleTime: twoMinutes,
  },

  () => ({ bridgeAsset: null }),

  { persistThrottleMs: 8_000, storageKey: 'verifiedTokenSearch' }
);

function selectTopSearchResults({
  abortController,
  data,
  query,
  inputAssetBridgeAssetAddress,
  inputAssetChainId,
  toChainId,
}: {
  abortController: AbortController | null;
  data: SearchAsset[];
  query: string | undefined;
  inputAssetBridgeAssetAddress: AddressOrEth | undefined;
  inputAssetChainId: ChainId | undefined;
  toChainId: ChainId;
}): VerifiedTokenData {
  const normalizedQuery = query?.trim().toLowerCase();
  const queryHasMultipleChars = !!(normalizedQuery && normalizedQuery.length > 1);
  const currentChainVerifiedResults: SearchAsset[] = [];
  const currentChainUnverifiedResults: SearchAsset[] = [];
  const crosschainResults: SearchAsset[] = [];
  let bridgeAsset: SearchAsset | null = null;

  const isCrossChainSearch = inputAssetBridgeAssetAddress && inputAssetChainId && inputAssetChainId !== toChainId;

  for (const asset of data) {
    if (abortController?.signal.aborted) break;
    const isCurrentNetwork = asset.chainId === toChainId;

    if (
      inputAssetBridgeAssetAddress &&
      (isCrossChainSearch ? asset.address === inputAssetBridgeAssetAddress : asset.mainnetAddress === inputAssetBridgeAssetAddress)
    ) {
      bridgeAsset = asset;
      if (isCrossChainSearch) continue;
    }

    const isMatch = isCurrentNetwork && (!!asset.icon_url || queryHasMultipleChars);

    if (isMatch) {
      if (asset.isVerified) {
        currentChainVerifiedResults.push(asset);
      } else {
        currentChainUnverifiedResults.push(asset);
      }
    } else {
      const isCrosschainMatch = (!isCurrentNetwork && queryHasMultipleChars && isExactMatch(asset, normalizedQuery)) || asset.isNativeAsset;
      if (isCrosschainMatch) crosschainResults.push(asset);
    }
  }

  if (abortController?.signal.aborted) return NO_RESULTS;

  currentChainVerifiedResults.sort((a, b) => {
    if (a.isNativeAsset !== b.isNativeAsset) return a.isNativeAsset ? -1 : 1;
    if (a.highLiquidity !== b.highLiquidity) return a.highLiquidity ? -1 : 1;
    return Object.keys(b.networks).length - Object.keys(a.networks).length;
  });

  return {
    bridgeAsset,
    crosschainResults: crosschainResults.slice(0, MAX_CROSSCHAIN_RESULTS),
    verifiedAssets: currentChainVerifiedResults.slice(0, MAX_VERIFIED_RESULTS),
    unverifiedAssets: currentChainUnverifiedResults.slice(0, MAX_UNVERIFIED_RESULTS),
  };
}

function isExactMatch(data: SearchAsset, query: string): boolean {
  return query === data.address?.toLowerCase() || data.symbol?.toLowerCase() === query || data.name?.toLowerCase() === query;
}

function getExactMatches(data: SearchAsset[], query: string, slice?: number): SearchAsset[] {
  const normalizedQuery = query.trim().toLowerCase();
  const results = data.filter(
    asset =>
      normalizedQuery === asset.address?.toLowerCase() ||
      asset.symbol?.toLowerCase() === normalizedQuery ||
      asset.name?.toLowerCase() === normalizedQuery
  );
  if (slice !== undefined) return results.slice(0, slice);
  return results;
}

export const ADDRESS_SEARCH_KEY: TokenSearchAssetKey[] = ['address'];
export const NAME_SYMBOL_SEARCH_KEYS: TokenSearchAssetKey[] = ['name', 'symbol'];

async function tokenSearchQueryFunction(
  { chainId, query, inputAssetBridgeAssetAddress, inputAssetChainId }: TokenSearchParams,
  abortController: AbortController | null
): Promise<VerifiedTokenData> {
  const queryParams: Omit<TokenSearchParams, 'chainId' | 'inputAssetBridgeAssetAddress' | 'inputAssetChainId'> = {
    query,
  };

  const searchDefaultVerifiedList = query === '';
  if (searchDefaultVerifiedList) {
    queryParams.list = 'verifiedAssets';
  }

  const url = `${searchDefaultVerifiedList ? `/${chainId}` : ''}/?${qs.stringify(queryParams)}`;

  try {
    const tokenSearch = await tokenSearchHttp.get<{ data: SearchAsset[] }>(url);
    return selectTopSearchResults({ abortController, data: parseTokenSearchResults(tokenSearch.data.data), query, inputAssetBridgeAssetAddress, inputAssetChainId, toChainId: chainId });
  } catch (e) {
    logger.error(new RainbowError('[tokenSearchQueryFunction]: Token search failed'), { url });
    return NO_RESULTS;
  }
}