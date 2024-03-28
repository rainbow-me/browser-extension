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
import {
  ETH_ADDRESS,
  SUPPORTED_MAINNET_CHAINS,
  SupportedCurrencyKey,
} from '~/core/references';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import {
  RainbowChainAsset,
  useRainbowChainAssetsStore,
} from '~/core/state/rainbowChainAssets';
import {
  AddressOrEth,
  AssetMetadata,
  ParsedAssetsDict,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  createAssetQuery,
  extractFulfilledValue,
  getAssetBalance,
  getCustomChainIconUrl,
  parseAssetMetadata,
  parseUserAssetBalances,
} from '~/core/utils/assets';
import { getRainbowChains } from '~/core/utils/chains';
import { convertDecimalFormatToRawAmount, isZero } from '~/core/utils/numbers';
import { RainbowError, logger } from '~/logger';

import { ASSETS_TIMEOUT_DURATION } from './assets';

const CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL = 60000;
export const CUSTOM_NETWORK_ASSETS_STALE_INTERVAL = 30000;

// ///////////////////////////////////////////////
// Query Types

export type CustomNetworkAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
  filterZeroBalance?: boolean;
  rainbowChainAssets?: Record<number, RainbowChainAsset[]>;
};

type SetCustomNetworkAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  customNetworkAssets?: CustomNetworkAssetsResult;
  testnetMode?: boolean;
  filterZeroBalance?: boolean;
  rainbowChainAssets: Record<number, RainbowChainAsset[]>;
};

type SetUserDefaultsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  staleTime: number;
  testnetMode?: boolean;
  filterZeroBalance?: boolean;
  rainbowChainAssets: Record<number, RainbowChainAsset[]>;
};

type FetchCustomNetworkAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
  filterZeroBalance?: boolean;
  rainbowChainAssets: Record<number, RainbowChainAsset[]>;
};

// ///////////////////////////////////////////////
// Query Key

export const customNetworkAssetsKey = ({
  address,
  currency,
  testnetMode,
  filterZeroBalance,
  rainbowChainAssets,
}: CustomNetworkAssetsArgs) =>
  createQueryKey(
    'CustomNetworkAssets',
    {
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    },
    { persisterVersion: 4 },
  );

type customNetworkAssetsKey = ReturnType<typeof customNetworkAssetsKey>;

// ///////////////////////////////////////////////
// Query Function

export const CustomNetworkAssetsFetchQuery = ({
  address,
  currency,
  testnetMode,
  filterZeroBalance,
  rainbowChainAssets,
}: FetchCustomNetworkAssetsArgs) => {
  queryClient.fetchQuery(
    customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
    customNetworkAssetsFunction,
  );
};

export const CustomNetworkAssetsSetQueryDefaults = ({
  address,
  currency,
  staleTime,
  testnetMode,
  filterZeroBalance,
  rainbowChainAssets,
}: SetUserDefaultsArgs) => {
  queryClient.setQueryDefaults(
    customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
    {
      staleTime,
    },
  );
};

export const CustomNetworkAssetsSetQueryData = ({
  address,
  currency,
  customNetworkAssets,
  testnetMode,
  filterZeroBalance,
  rainbowChainAssets,
}: SetCustomNetworkAssetsArgs) => {
  queryClient.setQueryData(
    customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
    customNetworkAssets,
  );
};

async function customNetworkAssetsFunction({
  queryKey: [
    { address, currency, testnetMode, filterZeroBalance, rainbowChainAssets },
  ],
}: QueryFunctionArgs<typeof customNetworkAssetsKey>) {
  const cache = queryClient.getQueryCache();
  const cachedCustomNetworkAssets = (cache.find(
    customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
  )?.state?.data || {}) as Record<ChainId | number, ParsedAssetsDict>;

  const { rainbowChains: chains } = getRainbowChains();

  const customChains = chains.filter((chain) =>
    testnetMode ? chain.testnet : !chain.testnet,
  );
  if (customChains.length === 0) {
    return cachedCustomNetworkAssets;
  }
  try {
    const assetsPromises = customChains
      .filter(
        (chain) =>
          !SUPPORTED_MAINNET_CHAINS.map((chain) => chain.id).includes(chain.id),
      )
      .map(async (chain) => {
        const provider = getProvider({ chainId: chain.id });
        const nativeAssetBalance = (
          await provider.getBalance(address)
        )?.toString();
        const customNetworkNativeAssetParsed =
          nativeAssetBalance &&
          (filterZeroBalance ? !isZero(nativeAssetBalance) : true)
            ? parseUserAssetBalances({
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
                  price: { value: 0 },
                  bridging: { isBridgeable: false, networks: [] },
                  mainnetAddress: ETH_ADDRESS as AddressOrEth,
                  icon_url: getCustomChainIconUrl(chain.id, ETH_ADDRESS),
                },
                currency,
                balance: nativeAssetBalance,
              })
            : null;

        const chainAssets = rainbowChainAssets?.[chain.id] || [];
        const chainParsedAssetBalances = await Promise.allSettled(
          chainAssets.map((asset) =>
            getAssetBalance({
              assetAddress: asset.address,
              currentAddress: address,
              provider,
            }),
          ),
        );

        const chainParsedAssets = chainParsedAssetBalances
          .map((balance, i) => {
            const fulfilledBalance = extractFulfilledValue(balance);
            return fulfilledBalance &&
              (filterZeroBalance ? !isZero(fulfilledBalance) : true)
              ? parseUserAssetBalances({
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
                })
              : null;
          })
          .filter(Boolean);

        const allCustomNetworkAssets = customNetworkNativeAssetParsed
          ? [customNetworkNativeAssetParsed, ...chainParsedAssets]
          : chainParsedAssets;

        // Now we'll try to fetch the prices for all the assets in this network
        const batchedQuery = allCustomNetworkAssets.map(
          ({ address }) => address,
        );
        const results: Record<string, AssetMetadata>[] = (await requestMetadata(
          createAssetQuery(batchedQuery, chain.id, currency, true),
          {
            timeout: ASSETS_TIMEOUT_DURATION,
          },
        )) as Record<string, AssetMetadata>[];

        const assets = Object.values(results).flat();
        assets.forEach((asset, i) => {
          const a = asset as unknown as AssetMetadata;
          const address = a.networks?.[chain.id]?.address as AddressOrEth;
          const parsedAsset = parseAssetMetadata({
            address,
            asset: a,
            chainId: chain.id,
            currency,
          });

          if (parsedAsset.price?.value) {
            allCustomNetworkAssets[i].price = {
              value: parsedAsset.price.value,
            };
            allCustomNetworkAssets[i].native.price = parsedAsset.native.price;

            const assetWithPriceAndNativeBalance = parseUserAssetBalances({
              asset: allCustomNetworkAssets[i],
              currency,
              balance: convertDecimalFormatToRawAmount(
                allCustomNetworkAssets[i].balance.amount,
                allCustomNetworkAssets[i].decimals,
              ),
            });

            allCustomNetworkAssets[i] = assetWithPriceAndNativeBalance;
          }
        });

        return {
          chainId: chain.id,
          assets: allCustomNetworkAssets,
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
  { address, currency, filterZeroBalance = true }: CustomNetworkAssetsArgs,
  config: QueryConfig<
    CustomNetworkAssetsResult,
    Error,
    TSelectResult,
    customNetworkAssetsKey
  > = {},
) {
  const { testnetMode } = useTestnetModeStore();
  const { rainbowChainAssets } = useRainbowChainAssetsStore();
  return useQuery(
    customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
    customNetworkAssetsFunction,
    {
      ...config,
      refetchInterval: CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL,
      staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
    },
  );
}
