import { AddressZero } from '@ethersproject/constants';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { requestMetadata } from '~/core/graphql';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import {
  AddressOrEth,
  AssetMetadata,
  ParsedAsset,
  ParsedAssetsDictByChain,
  ZerionAssetPrice,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  createAssetQuery,
  parseAssetMetadata,
  parseUserAssetBalances,
} from '~/core/utils/assets';
import { getCustomChains } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';

import { ASSETS_TIMEOUT_DURATION } from './assets';

const CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL = 60000;
export const CUSTOM_NETWORK_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

export type CustomNetworkAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
};

type SetCustomNetworkAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  customNetworkAssets?: CustomNetworkAssetsResult;
};

type SetUserDefaultsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
  staleTime: number;
};

type FetchCustomNetworkAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

export const customNetworkAssetsKey = ({
  address,
  currency,
}: CustomNetworkAssetsArgs) =>
  createQueryKey(
    'CustomNetworkAssets',
    { address, currency },
    { persisterVersion: 2 },
  );

type customNetworkAssetsKey = ReturnType<typeof customNetworkAssetsKey>;

// ///////////////////////////////////////////////
// Query Function

export const CustomNetworkAssetsFetchQuery = ({
  address,
  currency,
}: FetchCustomNetworkAssetsArgs) => {
  queryClient.fetchQuery(
    customNetworkAssetsKey({ address, currency }),
    customNetworkAssetsFunction,
  );
};

export const CustomNetworkAssetsSetQueryDefaults = ({
  address,
  currency,
  staleTime,
}: SetUserDefaultsArgs) => {
  queryClient.setQueryDefaults(customNetworkAssetsKey({ address, currency }), {
    staleTime,
  });
};

export const CustomNetworkAssetsSetQueryData = ({
  address,
  currency,
  customNetworkAssets,
}: SetCustomNetworkAssetsArgs) => {
  queryClient.setQueryData(
    customNetworkAssetsKey({ address, currency }),
    customNetworkAssets,
  );
};

async function customNetworkAssetsFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof customNetworkAssetsKey>) {
  const cache = queryClient.getQueryCache();
  const cachedCustomNetworkAssets = (cache.find(
    customNetworkAssetsKey({ address, currency }),
  )?.state?.data || {}) as ParsedAssetsDictByChain;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const parsedAssetsDict: ParsedAssetsDictByChain = {};
    if (address) {
      const { customChains } = getCustomChains();
      if (customChains.length > 0) {
        await Promise.all(
          customChains.map(async (chain) => {
            parsedAssetsDict[chain.id as ChainId] = {};
            const provider = getProvider({ chainId: chain.id });
            const nativeAssetBalance = await provider.getBalance(address);
            const customNetworkNativeAssetParsed = {
              address: AddressZero,
              chainId: chain.id,
              chainName: chain.name as ChainName,
              isNativeAsset: true,
              name: chain.nativeCurrency.symbol,
              symbol: chain.nativeCurrency.symbol,
              uniqueId: `${AddressZero}_${chain.id}`,
              decimals: 18,
              native: {
                price: undefined,
              },
              price: { value: 0 },
              bridging: { isBridgeable: false, networks: [] },
              mainnetAddress: AddressZero as AddressOrEth,
            } as ParsedAsset;

            // Now we'll try to fetch the prices for all the assets in this network
            // TODO: also add the assets that were added by the user.
            const batchedQuery = [AddressZero] as AddressOrEth[];

            const results: Record<string, AssetMetadata>[] =
              (await requestMetadata(
                createAssetQuery(batchedQuery, chain.id, currency, true),
                {
                  timeout: ASSETS_TIMEOUT_DURATION,
                },
              )) as Record<string, AssetMetadata>[];

            const assets = Object.values(results).flat();
            assets.forEach((asset) => {
              const a = asset as unknown as AssetMetadata;
              const address = a.networks?.[chain.id]?.address as AddressOrEth;
              const parsedAsset = parseAssetMetadata({
                address,
                asset: a,
                chainId: chain.id,
                currency,
              });
              if (parsedAsset?.native.price) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                customNetworkNativeAssetParsed.native.price =
                  parsedAsset.native.price;
                customNetworkNativeAssetParsed.price =
                  parsedAsset?.price as ZerionAssetPrice;
              }
            });

            parsedAssetsDict[chain.id as ChainId][
              customNetworkNativeAssetParsed.uniqueId
            ] = parseUserAssetBalances({
              asset: customNetworkNativeAssetParsed,
              currency,
              balance: nativeAssetBalance.toString(),
            });
          }),
        );
      }

      return parsedAssetsDict;
    }

    return cachedCustomNetworkAssets;
  } catch (e) {
    logger.error(new RainbowError('customNetworkAssetsFunction: '), {
      message: (e as Error)?.message,
    });

    return cachedCustomNetworkAssets;
  }
}

type CustomNetworkAssetsResult = QueryFunctionResult<
  typeof customNetworkAssetsFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useCustomNetworkAssets<
  TSelectResult = CustomNetworkAssetsResult,
>(
  { address, currency }: CustomNetworkAssetsArgs,
  config: QueryConfig<
    CustomNetworkAssetsResult,
    Error,
    TSelectResult,
    customNetworkAssetsKey
  > = {},
) {
  return useQuery(
    customNetworkAssetsKey({ address, currency }),
    customNetworkAssetsFunction,
    {
      ...config,
      refetchInterval: CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL,
      staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
    },
  );
}
