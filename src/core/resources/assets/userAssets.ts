import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

import { platformHttp } from '~/core/network/platform';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import { useStaleBalancesStore } from '~/core/state/staleBalances';
import {
  AssetApiResponse,
  ParsedAssetsDictByChain,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import type { GetAssetUpdatesResponse as PlatformGetAssetUpdatesResponse } from '~/core/types/gen/platform/assets/updates';
import { getSupportedChains } from '~/core/utils/chains';
import {
  convertPlatformAssetToAssetApiResponse,
  isAddressOrEth,
} from '~/core/utils/platform';
import { RainbowError, logger } from '~/logger';

import { parseUserAssets } from './common';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
const USER_ASSETS_TIMEOUT_DURATION = 20000;
const PLATFORM_ASSET_UPDATES_PATH = '/v1/assets/GetAssetUpdates';

// ///////////////////////////////////////////////
// Query Types

type UserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
};

type SetUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  userAssets?: UserAssetsResult;
  testnetMode?: boolean;
};

type SetUserDefaultsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  staleTime: number;
  testnetMode?: boolean;
};

type FetchUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
};

// ///////////////////////////////////////////////
// Query Key

const userAssetsQueryKey = ({
  address,
  currency,
  testnetMode,
}: UserAssetsArgs) =>
  createQueryKey(
    'userAssets',
    { address, currency, testnetMode },
    { persisterVersion: 3 },
  );

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export const userAssetsFetchQuery = ({
  address,
  currency,
  testnetMode,
}: FetchUserAssetsArgs) => {
  queryClient.fetchQuery({
    queryKey: userAssetsQueryKey({
      address,
      currency,
      testnetMode,
    }),
    queryFn: userAssetsQueryFunction,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userAssetsSetQueryDefaults = ({
  address,
  currency,
  staleTime,
  testnetMode,
}: SetUserDefaultsArgs) => {
  queryClient.setQueryDefaults(
    userAssetsQueryKey({ address, currency, testnetMode }),
    {
      staleTime,
    },
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userAssetsSetQueryData = ({
  address,
  currency,
  userAssets,
  testnetMode,
}: SetUserAssetsArgs) => {
  queryClient.setQueryData(
    userAssetsQueryKey({ address, currency, testnetMode }),
    userAssets,
  );
};

async function userAssetsQueryFunction({
  queryKey: [{ address, currency, testnetMode }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>) {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = (cache.find({
    queryKey: userAssetsQueryKey({
      address,
      currency,
      testnetMode,
    }),
  })?.state?.data || {}) as ParsedAssetsDictByChain;
  const supportedAssetsChainIds = useNetworkStore
    .getState()
    .getSupportedAssetsChainIds();

  const supportedChainIds = getSupportedChains({
    testnets: testnetMode,
  })
    .map(({ id }) => id)
    .filter((id) => supportedAssetsChainIds.includes(id));

  if (!address || supportedChainIds.length === 0) {
    return cachedUserAssets;
  }

  try {
    const staleBalancesStore = useStaleBalancesStore.getState();
    staleBalancesStore.clearExpiredData(address);
    const forcedTokensParam = extractForcedTokens(
      staleBalancesStore.getStaleBalancesQueryParam(address),
    );

    const platformResult = await fetchPlatformAssetBalances({
      address,
      chainIds: supportedChainIds,
      currency,
      forcedTokens: forcedTokensParam,
      timeout: USER_ASSETS_TIMEOUT_DURATION,
    });
    const normalizedAssets = convertPlatformResultToLegacy(platformResult);
    const chainIdsInResponse = getChainIdsFromAssets(normalizedAssets);

    if (normalizedAssets.length && chainIdsInResponse.length) {
      const parsedAssetsDict = await parseUserAssets({
        address,
        assets: normalizedAssets,
        chainIds: chainIdsInResponse,
        currency,
      });

      return parsedAssetsDict;
    }

    return cachedUserAssets;
  } catch (e) {
    // trigger per chain retry by chainIds on error
    for (const chainId of supportedChainIds) {
      userAssetsQueryFunctionRetryByChain({
        address,
        chainIds: [chainId],
        currency,
        testnetMode,
      });
    }

    logger.error(
      new RainbowError('userAssetsQueryFunction: ', {
        cause: e,
      }),
      {
        message: (e as Error)?.message,
      },
    );
    return cachedUserAssets;
  }
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

async function userAssetsQueryFunctionRetryByChain({
  address,
  chainIds,
  currency,
  testnetMode,
}: {
  address: Address;
  chainIds: ChainId[];
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
}) {
  try {
    const cache = queryClient.getQueryCache();
    const cachedUserAssets =
      (cache.find({
        queryKey: userAssetsQueryKey({
          address,
          currency,
          testnetMode,
        }),
      })?.state?.data as ParsedAssetsDictByChain) || {};
    const retries = [];
    for (const chainIdWithError of chainIds) {
      retries.push(
        fetchUserAssetsByChain(
          {
            address,
            chainId: chainIdWithError,
            currency,
          },
          { gcTime: 0 },
        ),
      );
    }

    if (retries.length === 0) {
      return;
    }

    const settledResults = await Promise.allSettled(retries);

    // lodash partition does not seperate by type
    const failedResults = settledResults
      .map((result, idx) =>
        result.status === 'rejected'
          ? { chainId: chainIds[idx], reason: result.reason }
          : null,
      )
      .filter((r) => r !== null);
    const successfulResults = settledResults
      .map((result) => (result.status === 'fulfilled' ? result.value : null))
      .filter((parsedAssets) => parsedAssets !== null);

    if (successfulResults.length === 0) {
      // If all failed, throw the first error
      throw (
        failedResults[0]?.reason ?? new Error('All user asset fetches failed')
      );
    }

    if (failedResults.length > 0) {
      logger.error(
        new RainbowError(
          'userAssetsQueryFunctionRetryByChain: Some chains failed',
          { cause: failedResults[0]?.reason },
        ),
        {
          failedChains: failedResults.map((f) => f.chainId),
          reasons: failedResults.map((f) =>
            f.reason instanceof Error ? f.reason.message : String(f.reason),
          ),
          causes: failedResults.map((f) => f.reason),
        },
      );
    }

    for (const parsedAssets of successfulResults) {
      const values = Object.values(parsedAssets);
      if (values[0]) {
        cachedUserAssets[values[0].chainId] = parsedAssets;
      }
    }
    queryClient.setQueryData(
      userAssetsQueryKey({
        address,
        currency,
        testnetMode,
      }),
      cachedUserAssets,
    );
  } catch (e) {
    logger.error(
      new RainbowError('userAssetsQueryFunctionRetryByChain: ', {
        cause: e,
      }),
      {
        message: (e as Error)?.message,
      },
    );
  }
}

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets<TSelectResult = UserAssetsResult>(
  { address, currency }: UserAssetsArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    TSelectResult,
    UserAssetsQueryKey
  > = {},
) {
  const { testnetMode } = useTestnetModeStore();
  return useQuery({
    queryKey: userAssetsQueryKey({
      address,
      currency,
      testnetMode,
    }),
    queryFn: userAssetsQueryFunction,
    ...config,
    enabled: !!address && config.enabled !== false,
    refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
    placeholderData: (previousData) => previousData,
  });
}

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsByChainArgs = {
  address: Address;
  chainId: ChainId;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const userAssetsByChainQueryKey = ({
  address,
  chainId,
  currency,
}: UserAssetsByChainArgs) =>
  createQueryKey(
    'userAssetsByChain',
    { address, chainId, currency },
    { persisterVersion: 1 },
  );

type UserAssetsByChainQueryKey = ReturnType<typeof userAssetsByChainQueryKey>;

// ///////////////////////////////////////////////
// Query Fetcher

async function fetchUserAssetsByChain<TSelectData = UserAssetsByChainResult>(
  { address, chainId, currency }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectData,
    UserAssetsByChainQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: userAssetsByChainQueryKey({
      address,
      chainId,
      currency,
    }),
    queryFn: userAssetsByChainQueryFunction,
    ...config,
  });
}

// ///////////////////////////////////////////////
// Query Function

async function userAssetsByChainQueryFunction({
  queryKey: [{ address, chainId, currency }],
}: QueryFunctionArgs<typeof userAssetsByChainQueryKey>): Promise<
  Record<string, ParsedUserAsset>
> {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = (cache.find({
    queryKey: userAssetsQueryKey({ address, currency }),
  })?.state?.data || {}) as ParsedAssetsDictByChain;
  const cachedDataForChain = cachedUserAssets?.[chainId] ?? {};
  try {
    const platformResult = await fetchPlatformAssetBalances({
      address,
      chainIds: [chainId],
      currency,
      timeout: USER_ASSETS_TIMEOUT_DURATION,
    });
    const normalizedAssets = convertPlatformResultToLegacy(platformResult);
    const chainIdsInResponse = getChainIdsFromAssets(normalizedAssets);
    if (normalizedAssets.length && chainIdsInResponse.includes(chainId)) {
      const parsedAssetsDict = await parseUserAssets({
        address,
        assets: normalizedAssets,
        chainIds: chainIdsInResponse,
        currency,
      });

      return parsedAssetsDict[chainId] ?? {};
    }
    return cachedDataForChain;
  } catch (e) {
    if (!(e instanceof Error && e.name === 'AbortError'))
      // abort errors are expected
      logger.error(
        new RainbowError(
          `userAssetsByChainQueryFunction - chainId = ${chainId}:`,
        ),
        {
          message: (e as Error)?.message,
        },
      );
    return cachedDataForChain;
  }
}

type UserAssetsByChainResult = QueryFunctionResult<
  typeof userAssetsByChainQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssetsByChain<TSelectResult = UserAssetsByChainResult>(
  { address, chainId, currency }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectResult,
    UserAssetsByChainQueryKey
  > = {},
) {
  return useQuery({
    queryKey: userAssetsByChainQueryKey({
      address,
      chainId,
      currency,
    }),
    queryFn: userAssetsByChainQueryFunction,
    ...config,
    enabled: !!address && config.enabled !== false,
    refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
  });
}

type LegacyAssetEntry = {
  quantity: string;
  small_balance?: boolean;
  value?: string;
  asset: AssetApiResponse;
};

function extractForcedTokens(param: string) {
  if (!param) return undefined;
  const trimmed = param.startsWith('&') ? param.slice(1) : param;
  if (!trimmed.startsWith('tokens=')) return undefined;
  const tokensString = trimmed.substring('tokens='.length);
  if (!tokensString.length) return undefined;

  // Filter out invalid tokens (those containing "undefined" or invalid addresses)
  const validTokens = tokensString.split(',').filter((token) => {
    // Skip tokens that contain "undefined"
    if (token.includes('undefined')) return false;

    // Validate format: address:chainId
    const [address, chainIdStr] = token.split(':');
    if (!address || !chainIdStr) return false;

    // Validate address is a valid Ethereum address or ETH
    if (!isAddressOrEth(address)) return false;

    // Validate chainId is a valid number
    const chainId = parseInt(chainIdStr, 10);
    if (isNaN(chainId)) return false;

    return true;
  });

  return validTokens.length > 0 ? validTokens.join(',') : undefined;
}

async function fetchPlatformAssetBalances({
  address,
  chainIds,
  currency,
  forcedTokens,
  timeout,
}: {
  address: Address;
  chainIds: number[];
  currency: SupportedCurrencyKey;
  forcedTokens?: string;
  timeout?: number;
}) {
  if (chainIds.length === 0) {
    return {} as PlatformGetAssetUpdatesResponse['result'];
  }

  const params: Record<string, string> = {
    address,
    currency: currency.toLowerCase(),
    chain_ids: chainIds.join(','),
  };

  if (forcedTokens) {
    params.forced_tokens = forcedTokens;
  }

  const response = await platformHttp.get<PlatformGetAssetUpdatesResponse>(
    PLATFORM_ASSET_UPDATES_PATH,
    {
      params,
      timeout,
    },
  );

  return response?.data?.result ?? {};
}

function convertPlatformResultToLegacy(
  result: PlatformGetAssetUpdatesResponse['result'],
) {
  if (!result) return [];
  return Object.values(result)
    .map((entry) =>
      !entry?.asset
        ? undefined
        : {
            quantity: entry.quantity,
            small_balance: entry.smallBalance,
            value: entry.value,
            asset: convertPlatformAssetToAssetApiResponse(entry.asset),
          },
    )
    .filter((entry) => entry !== undefined);
}

function getChainIdsFromAssets(assets: LegacyAssetEntry[]) {
  const chainIds = new Set<ChainId>();
  for (const entry of assets) {
    if (typeof entry?.asset?.chain_id === 'number') {
      chainIds.add(entry.asset.chain_id as ChainId);
    }
  }
  return Array.from(chainIds);
}
