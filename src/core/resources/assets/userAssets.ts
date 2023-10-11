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
import { useConnectedToHardhatStore } from '~/core/state/currentSettings/connectedToHardhat';
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
  parseUserAsset,
} from '~/core/utils/assets';
import { getSupportedChainIds } from '~/core/utils/chains';
import { greaterThan } from '~/core/utils/numbers';
import { RainbowError, logger } from '~/logger';
import {
  DAI_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  OPTIMSIM_MAINNET_ASSET,
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
};

type SetUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  userAssets?: UserAssetsResult;
};

type SetUserDefaultsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  staleTime: number;
};

type FetchUserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

export const userAssetsQueryKey = ({ address, currency }: UserAssetsArgs) =>
  createQueryKey('userAssets', { address, currency }, { persisterVersion: 2 });

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export const userAssetsFetchQuery = ({
  address,
  currency,
}: FetchUserAssetsArgs) => {
  queryClient.fetchQuery(
    userAssetsQueryKey({ address, currency }),
    userAssetsQueryFunction,
  );
};

export const userAssetsSetQueryDefaults = ({
  address,
  currency,
  staleTime,
}: SetUserDefaultsArgs) => {
  queryClient.setQueryDefaults(userAssetsQueryKey({ address, currency }), {
    staleTime,
  });
};

export const userAssetsSetQueryData = ({
  address,
  currency,
  userAssets,
}: SetUserAssetsArgs) => {
  queryClient.setQueryData(
    userAssetsQueryKey({ address, currency }),
    userAssets,
  );
};

async function userAssetsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>) {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = (cache.find(
    userAssetsQueryKey({ address, currency }),
  )?.state?.data || {}) as ParsedAssetsDictByChain;
  try {
    const url = `/${getSupportedChainIds().join(',')}/${address}/assets`;
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
        currency,
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
}: {
  address: Address;
  chainIds: ChainId[];
  currency: SupportedCurrencyKey;
}) {
  try {
    const cache = queryClient.getQueryCache();
    const cachedUserAssets =
      (cache.find(userAssetsQueryKey({ address, currency }))?.state
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
      userAssetsQueryKey({ address, currency }),
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
  currency,
}: {
  address: Address;
  assets: {
    quantity: string;
    small_balance?: boolean;
    asset: ZerionAsset;
  }[];
  chainIds: ChainId[];
  currency: SupportedCurrencyKey;
}) {
  const { connectedToHardhat, connectedToHardhatOp } =
    useConnectedToHardhatStore.getState();

  const parsedAssetsDict = chainIds.reduce(
    (dict, currentChainId) => ({ ...dict, [currentChainId]: {} }),
    {},
  ) as ParsedAssetsDictByChain;
  for (const { asset, quantity, small_balance } of assets) {
    if (!filterAsset(asset) && greaterThan(quantity, 0)) {
      const parsedAsset = parseUserAsset({
        asset,
        currency,
        balance: quantity,
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
      async (asset) => {
        if (asset.chainId !== ChainId.mainnet) return asset;
        try {
          const parsedAsset = await fetchAssetBalanceViaProvider({
            parsedAsset: asset,
            currentAddress: address,
            currency,
            provider,
          });
          return parsedAsset;
        } catch (e) {
          return asset;
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
  if (connectedToHardhatOp) {
    const provider = getProvider({ chainId: ChainId.hardhatOptimism });
    // force checking for ETH if connected to hardhat
    const opAssets = parsedAssetsDict[ChainId.optimism];
    opAssets[OPTIMSIM_MAINNET_ASSET.uniqueId] = OPTIMSIM_MAINNET_ASSET;
    if (process.env.IS_TESTING === 'true') {
      opAssets[USDC_MAINNET_ASSET.uniqueId] = USDC_MAINNET_ASSET;
      opAssets[DAI_MAINNET_ASSET.uniqueId] = DAI_MAINNET_ASSET;
    }
    const opBalanceRequests = Object.values(opAssets).map(async (asset) => {
      if (asset.chainId !== ChainId.optimism) return asset;
      try {
        const parsedAsset = await fetchAssetBalanceViaProvider({
          parsedAsset: asset,
          currentAddress: address,
          currency,
          provider,
        });
        return parsedAsset;
      } catch (e) {
        return asset;
      }
    });
    const newParsedOpAssetsByUniqueId = await Promise.all(opBalanceRequests);
    const newOpAssets = newParsedOpAssetsByUniqueId.reduce<
      Record<string, ParsedUserAsset>
    >((acc, parsedAsset) => {
      acc[parsedAsset.uniqueId] = parsedAsset;
      return acc;
    }, {});
    parsedAssetsDict[ChainId.optimism] = newOpAssets;
  }
  return parsedAssetsDict;
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
  return useQuery(
    userAssetsQueryKey({ address, currency }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
      staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
    },
  );
}
