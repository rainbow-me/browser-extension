import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
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
import {
  ParsedAssetsDictByChain,
  ParsedUserAsset,
  ZerionAsset,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import {
  fetchAssetBalanceViaProvider,
  filterAsset,
  parseAddressAsset,
} from '~/core/utils/assets';
import { SUPPORTED_CHAIN_IDS } from '~/core/utils/chains';
import { greaterThan } from '~/core/utils/numbers';
import { RainbowError, logger } from '~/logger';
import {
  DAI_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  USDC_MAINNET_ASSET,
} from '~/test/utils';

import { fetchUserAssetsByChain } from './userAssetsByChain';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
const USER_ASSETS_TIMEOUT_DURATION = 20000;
export const USER_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
};

type SetUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
  userAssets?: UserAssetsResult;
};

type SetUserDefaultsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
  staleTime: number;
};

type FetchUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
};

// ///////////////////////////////////////////////
// Query Key

export const userAssetsQueryKey = ({
  address,
  currency,
  connectedToHardhat,
}: UserAssetsArgs) =>
  createQueryKey(
    'userAssets',
    { address, currency, connectedToHardhat },
    { persisterVersion: 2 },
  );

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export const userAssetsFetchQuery = ({
  address,
  currency,
  connectedToHardhat,
}: FetchUserAssetsArgs) => {
  queryClient.fetchQuery(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
    userAssetsQueryFunction,
  );
};

export const userAssetsSetQueryDefaults = ({
  address,
  currency,
  connectedToHardhat,
  staleTime,
}: SetUserDefaultsArgs) => {
  queryClient.setQueryDefaults(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
    { staleTime },
  );
};

export const userAssetsSetQueryData = ({
  address,
  currency,
  connectedToHardhat,
  userAssets,
}: SetUserAssetsArgs) => {
  queryClient.setQueryData(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
    userAssets,
  );
};

async function userAssetsQueryFunction({
  queryKey: [{ address, currency, connectedToHardhat }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>) {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = (cache.find(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
  )?.state?.data || {}) as ParsedAssetsDictByChain;
  try {
    const url = `/${SUPPORTED_CHAIN_IDS.join(',')}/${address}/assets`;
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
    if (address) {
      userAssetsQueryFunctionRetryByChain({
        address,
        chainIds: chainIdsWithErrorsInResponse,
        connectedToHardhat,
        currency,
      });
      if (assets.length && chainIdsInResponse.length) {
        const parsedAssetsDict = await parseUserAssets({
          address,
          assets,
          chainIds: chainIdsInResponse,
          connectedToHardhat,
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
  connectedToHardhat,
  currency,
}: {
  address: Address;
  chainIds: ChainId[];
  connectedToHardhat: boolean;
  currency: SupportedCurrencyKey;
}) {
  try {
    const cache = queryClient.getQueryCache();
    const cachedUserAssets =
      (cache.find(userAssetsQueryKey({ address, currency, connectedToHardhat }))
        ?.state?.data as ParsedAssetsDictByChain) || {};
    const retries = [];
    for (const chainIdWithError of chainIds) {
      retries.push(
        fetchUserAssetsByChain(
          {
            address,
            chainId: chainIdWithError,
            connectedToHardhat,
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
      userAssetsQueryKey({ address, connectedToHardhat, currency }),
      cachedUserAssets,
    );
  } catch (e) {
    logger.error(new RainbowError('userAssetsQueryFunctionRetryByChain: '), {
      message: (e as Error)?.message,
    });
  }
}

export async function parseUserAssets({
  address,
  assets,
  chainIds,
  connectedToHardhat,
  currency,
}: {
  address: Address;
  assets: {
    quantity: string;
    small_balance?: boolean;
    asset: ZerionAsset;
  }[];
  chainIds: ChainId[];
  connectedToHardhat: boolean;
  currency: SupportedCurrencyKey;
}) {
  const parsedAssetsDict = chainIds.reduce(
    (dict, currentChainId) => ({ ...dict, [currentChainId]: {} }),
    {},
  ) as ParsedAssetsDictByChain;
  for (const { asset, quantity, small_balance } of assets) {
    if (!filterAsset(asset) && greaterThan(quantity, 0)) {
      const parsedAsset = parseAddressAsset({
        address: asset?.asset_code,
        asset,
        currency,
        quantity,
        smallBalance: small_balance,
      });
      parsedAssetsDict[parsedAsset?.chainId][parsedAsset.uniqueId] =
        parsedAsset;
    }
  }
  if (connectedToHardhat) {
    const provider = getProvider({ chainId: ChainId.hardhat });
    // force checking for ETH if connected to hardhat
    const mainnetAssets = parsedAssetsDict[ChainId.mainnet];
    mainnetAssets[ETH_MAINNET_ASSET.uniqueId] = ETH_MAINNET_ASSET;
    if (process.env.IS_TESTING === 'true') {
      mainnetAssets[USDC_MAINNET_ASSET.uniqueId] = USDC_MAINNET_ASSET;
      mainnetAssets[DAI_MAINNET_ASSET.uniqueId] = DAI_MAINNET_ASSET;
    }
    const mainnetBalanceRequests = Object.values(mainnetAssets).map(
      async (parsedAsset) => {
        if (parsedAsset.chainId !== ChainId.mainnet) return parsedAsset;
        try {
          const _parsedAsset = await fetchAssetBalanceViaProvider({
            parsedAsset,
            currentAddress: address,
            currency,
            provider,
          });
          return _parsedAsset;
        } catch (e) {
          return parsedAsset;
        }
      },
    );
    const newParsedMainnetAssetsByUniqueId = await Promise.all(
      mainnetBalanceRequests,
    );
    const newMainnetAssets = newParsedMainnetAssetsByUniqueId.reduce<
      Record<string, ParsedUserAsset>
    >((acc, parsedAsset) => {
      acc[parsedAsset.uniqueId] = parsedAsset;
      return acc;
    }, {});
    parsedAssetsDict[ChainId.mainnet] = newMainnetAssets;
  }
  return parsedAssetsDict;
}

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets<TSelectResult = UserAssetsResult>(
  { address, currency, connectedToHardhat }: UserAssetsArgs,
  config: QueryConfig<
    UserAssetsResult,
    Error,
    TSelectResult,
    UserAssetsQueryKey
  > = {},
) {
  return useQuery(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
      staleTime: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
