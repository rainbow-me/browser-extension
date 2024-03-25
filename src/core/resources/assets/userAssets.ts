import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { addysHttp } from '~/core/network/addys';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { ParsedAssetsDictByChain, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import { getBackendSupportedChains } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';

import { parseUserAssets } from './common';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
const USER_ASSETS_TIMEOUT_DURATION = 20000;
export const USER_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsArgs = {
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

export const userAssetsQueryKey = ({
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
  queryClient.fetchQuery(
    userAssetsQueryKey({ address, currency, testnetMode }),
    userAssetsQueryFunction,
  );
};

export const userAssetsSetQueryDefaults = ({
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

export const userAssetsSetQueryData = ({
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
  const cachedUserAssets = (cache.find(
    userAssetsQueryKey({ address, currency, testnetMode }),
  )?.state?.data || {}) as ParsedAssetsDictByChain;
  try {
    const supportedChainIds = getBackendSupportedChains({ testnetMode }).map(
      ({ id }) => id,
    );
    const url = `/${supportedChainIds.join(',')}/${address}/assets`;
    const res = await addysHttp.get<AddressAssetsReceivedMessage>(url, {
      params: {
        currency: currency.toLowerCase(),
      },
      timeout: USER_ASSETS_TIMEOUT_DURATION,
    });
    const chainIdsInResponse = res?.data?.meta?.chain_ids || [];
    const chainIdsWithErrorsInResponse =
      res?.data?.meta?.chain_ids_with_errors || [];
    const assets = res?.data?.payload?.assets || [];
    console.log('BE assets', assets);
    if (address) {
      userAssetsQueryFunctionRetryByChain({
        address,
        chainIds: chainIdsWithErrorsInResponse,
        currency,
        testnetMode,
      });
      if (assets.length && chainIdsInResponse.length) {
        const parsedAssetsDict = await parseUserAssets({
          address,
          assets,
          chainIds: chainIdsInResponse,
          currency,
        });

        for (const missingChainId of chainIdsWithErrorsInResponse) {
          if (cachedUserAssets[missingChainId]) {
            parsedAssetsDict[missingChainId] = cachedUserAssets[missingChainId];
          }
        }
        return parsedAssetsDict;
      }
    }
    return cachedUserAssets;
  } catch (e) {
    logger.error(new RainbowError('userAssetsQueryFunction: '), {
      message: (e as Error)?.message,
    });
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
      (cache.find(userAssetsQueryKey({ address, currency, testnetMode }))?.state
        ?.data as ParsedAssetsDictByChain) || {};
    const retries = [];
    for (const chainIdWithError of chainIds) {
      retries.push(
        fetchUserAssetsByChain(
          {
            address,
            chainId: chainIdWithError,
            currency,
          },
          { cacheTime: 0 },
        ),
      );
    }
    const parsedRetries = await Promise.all(retries);
    for (const parsedAssets of parsedRetries) {
      const values = Object.values(parsedAssets);
      if (values[0]) {
        cachedUserAssets[values[0].chainId] = parsedAssets;
      }
    }
    queryClient.setQueryData(
      userAssetsQueryKey({ address, currency, testnetMode }),
      cachedUserAssets,
    );
  } catch (e) {
    logger.error(new RainbowError('userAssetsQueryFunctionRetryByChain: '), {
      message: (e as Error)?.message,
    });
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
  return useQuery(
    userAssetsQueryKey({ address, currency, testnetMode }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
      staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
    },
  );
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

export const userAssetsByChainQueryKey = ({
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

export async function fetchUserAssetsByChain<
  TSelectData = UserAssetsByChainResult,
>(
  { address, chainId, currency }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectData,
    UserAssetsByChainQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    userAssetsByChainQueryKey({
      address,
      chainId,
      currency,
    }),
    userAssetsByChainQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Function

export async function userAssetsByChainQueryFunction({
  queryKey: [{ address, chainId, currency }],
}: QueryFunctionArgs<typeof userAssetsByChainQueryKey>): Promise<
  Record<string, ParsedUserAsset>
> {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = (cache.find(
    userAssetsQueryKey({ address, currency }),
  )?.state?.data || {}) as ParsedAssetsDictByChain;
  const cachedDataForChain = cachedUserAssets?.[chainId];
  try {
    const url = `/${chainId}/${address}/assets/?currency=${currency.toLowerCase()}`;
    const res = await addysHttp.get<AddressAssetsReceivedMessage>(url);
    const chainIdsInResponse = res?.data?.meta?.chain_ids || [];
    const assets = res?.data?.payload?.assets || [];
    if (assets.length && chainIdsInResponse.length) {
      const parsedAssetsDict = await parseUserAssets({
        address,
        assets,
        chainIds: chainIdsInResponse,
        currency,
      });

      return parsedAssetsDict[chainId];
    } else {
      return cachedDataForChain;
    }
  } catch (e) {
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
  return useQuery(
    userAssetsByChainQueryKey({
      address,
      chainId,
      currency,
    }),
    userAssetsByChainQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
