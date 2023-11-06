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
import { AddressOrEth, ParsedAssetsDictByChain } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { parseUserAssetBalances } from '~/core/utils/assets';
import { getCustomNetworks } from '~/core/utils/customNetworks';
import { RainbowError, logger } from '~/logger';

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
      const customChains = getCustomNetworks();
      if (customChains.length > 0) {
        await Promise.all(
          customChains.map(async (chain) => {
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
              balance: nativeAssetBalance.toString(), // FORMAT?
            });

            // TODO - add support for custom network tokens here (BX-1073)

            parsedAssetsDict[chain.id as ChainId] = {
              [customNetworkNativeAssetParsed.uniqueId]:
                customNetworkNativeAssetParsed,
            };
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
