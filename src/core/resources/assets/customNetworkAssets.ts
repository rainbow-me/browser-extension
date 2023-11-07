import { AddressZero } from '@ethersproject/constants';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { customRPCAssetsStore } from '~/core/state/customRPCAssets';
import {
  AddressOrEth,
  ParsedAssetsDict,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  extractFulfilledValue,
  getAssetBalance,
  parseUserAssetBalances,
} from '~/core/utils/assets';
import { getCustomChains } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';

const CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL = 60000;
export const CUSTOM_NETWORK_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

export type CustomNetworkAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
};

type SetCustomNetworkAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  customNetworkAssets?: CustomNetworkAssetsResult;
};

type SetUserDefaultsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  staleTime: number;
};

type FetchCustomNetworkAssetsArgs = {
  address: Address;
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
  )?.state?.data || {}) as Record<ChainId | number, ParsedAssetsDict>;
  const { customChains } = getCustomChains();
  if (customChains.length === 0) {
    return cachedCustomNetworkAssets;
  }
  const { customRPCAssets } = customRPCAssetsStore.getState();

  try {
    const assetsPromises = customChains.map(async (chain) => {
      const provider = getProvider({ chainId: chain.id });
      const nativeAssetBalance = await provider.getBalance(address);
      const customNetworkNativeAssetParsed = parseUserAssetBalances({
        asset: {
          address: AddressZero,
          chainId: chain.id,
          chainName: chain.name as ChainName,
          isNativeAsset: true,
          name: chain.nativeCurrency.symbol,
          symbol: chain.nativeCurrency.symbol,
          uniqueId: `${AddressZero}_${chain.id}`,
          decimals: 18,
          native: { price: undefined },
          bridging: { isBridgeable: false, networks: [] },
          mainnetAddress: AddressZero as AddressOrEth,
        },
        currency,
        balance: nativeAssetBalance.toString(),
      });

      const chainAssets = customRPCAssets[chain.id] || [];
      const chainParsedAssetBalances = await Promise.allSettled(
        chainAssets.map((asset) =>
          getAssetBalance({
            assetAddress: asset.address,
            currentAddress: address,
            provider,
          }),
        ),
      );

      const chainParsedAssets = chainParsedAssetBalances.map((balance, i) => {
        const fulfilledBalance = extractFulfilledValue(balance);
        return parseUserAssetBalances({
          asset: {
            ...chainAssets[i],
            chainId: chain.id,
            chainName: chain.name as ChainName,
            uniqueId: `${chainAssets[i].address}_${chain.id}`,
            mainnetAddress: undefined,
            isNativeAsset: false,
            native: { price: undefined },
          },
          currency,
          balance: fulfilledBalance || '0',
        });
      });

      return {
        chainId: chain.id,
        assets: [customNetworkNativeAssetParsed, ...chainParsedAssets],
      };
    });
    const assetsResults = (await Promise.allSettled(assetsPromises))
      .map((assets) => extractFulfilledValue(assets))
      .filter(Boolean);
    const parsedAssetsDict: Record<ChainId | number, ParsedAssetsDict> =
      assetsResults.reduce(
        (acc, { chainId, assets }) => {
          acc[Number(chainId)] = assets.reduce(
            (chainAcc, asset) => {
              chainAcc[asset.uniqueId] = asset;
              return chainAcc;
            },
            {} as Record<string, ParsedUserAsset>,
          );
          return acc;
        },
        {} as Record<ChainId | number, ParsedAssetsDict>,
      );

    return parsedAssetsDict;
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
