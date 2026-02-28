import { useQuery } from '@tanstack/react-query';
import { Address, parseUnits, zeroAddress } from 'viem';

import { metadataClient } from '~/core/graphql';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { ETH_ADDRESS, SupportedCurrencyKey } from '~/core/references';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useNetworkStore } from '~/core/state/networks/networks';
import {
  RainbowChainAsset,
  useRainbowChainAssetsStore,
} from '~/core/state/rainbowChainAssets';
import {
  AddressOrEth,
  ParsedAssetsDict,
  ParsedUserAsset,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import {
  extractFulfilledValue,
  getAssetBalance,
  getCustomChainIconUrl,
  parseAssetMetadata,
  parseUserAssetBalances,
} from '~/core/utils/assets';
import { getErrorMessage } from '~/core/utils/errors';
import { getViemClient } from '~/core/viem/clients';
import { RainbowError, logger } from '~/logger';

import { ASSETS_TIMEOUT_DURATION } from './assets';

const CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CustomNetworkAssetsArgs = {
  address: Address;
  currency: SupportedCurrencyKey;
  testnetMode?: boolean;
  filterZeroBalance?: boolean;
  rainbowChainAssets?: Record<number, RainbowChainAsset[]>;
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

const customNetworkAssetsKey = ({
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomNetworkAssetsFetchQuery = ({
  address,
  currency,
  testnetMode,
  filterZeroBalance,
  rainbowChainAssets,
}: FetchCustomNetworkAssetsArgs) => {
  queryClient.fetchQuery({
    queryKey: customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
    queryFn: customNetworkAssetsFunction,
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CustomNetworkAssetsSetQueryDefaults = ({
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

async function customNetworkAssetsFunction({
  queryKey: [
    { address, currency, testnetMode, filterZeroBalance, rainbowChainAssets },
  ],
}: QueryFunctionArgs<typeof customNetworkAssetsKey>) {
  const cache = queryClient.getQueryCache();
  const cachedCustomNetworkAssets = (cache.find({
    queryKey: customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
  })?.state?.data || {}) as Record<ChainId | number, ParsedAssetsDict>;

  const activeChains = useNetworkStore.getState().getAllActiveRpcChains();
  const supportedMainnetChains = useNetworkStore
    .getState()
    .getBackendSupportedChains();

  const customChains = activeChains.filter(
    (chain) =>
      (testnetMode ? chain.testnet : !chain.testnet) &&
      !supportedMainnetChains[chain.id],
  );

  if (customChains.length === 0) {
    return cachedCustomNetworkAssets;
  }
  try {
    const assetsPromises = customChains
      .filter((chain) => !supportedMainnetChains[chain.id])
      .map(async (chain) => {
        const client = getViemClient({ chainId: chain.id });
        const nativeAssetBalance = (
          await client.getBalance({ address })
        )?.toString();
        const customNetworkNativeAssetParsed =
          nativeAssetBalance &&
          (filterZeroBalance ? Number(nativeAssetBalance) !== 0 : true)
            ? parseUserAssetBalances({
                asset: {
                  address: zeroAddress,
                  chainId: chain.id,
                  chainName: chain.name as ChainName,
                  isNativeAsset: true,
                  name: chain.nativeCurrency.symbol,
                  symbol: chain.nativeCurrency.symbol,
                  uniqueId: `${zeroAddress}_${chain.id}`,
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
              chainId: chain.id,
            }),
          ),
        );

        const chainParsedAssets = chainParsedAssetBalances
          .map((balance, i) => {
            const fulfilledBalance = extractFulfilledValue(balance);
            return fulfilledBalance &&
              (filterZeroBalance ? Number(fulfilledBalance) !== 0 : true)
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

        const tokenResponses = await Promise.all(
          allCustomNetworkAssets.map(({ address }) =>
            metadataClient.tokenMetadata(
              { address, chainId: chain.id, currency },
              { timeout: ASSETS_TIMEOUT_DURATION },
            ),
          ),
        );

        tokenResponses.forEach((response, i) => {
          const asset = response.token;
          if (!asset) return;
          const tokenAddress = asset.networks[chain.id]
            ?.address as AddressOrEth;
          const parsedAsset = parseAssetMetadata({
            address: tokenAddress,
            asset,
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
              balance: parseUnits(
                allCustomNetworkAssets[i].balance.amount,
                allCustomNetworkAssets[i].decimals,
              ).toString(),
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
      message: getErrorMessage(e),
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
  return useQuery({
    queryKey: customNetworkAssetsKey({
      address,
      currency,
      testnetMode,
      filterZeroBalance,
      rainbowChainAssets,
    }),
    queryFn: customNetworkAssetsFunction,
    ...config,
    enabled: !!address && config.enabled !== false,
    refetchInterval: CUSTOM_NETWORK_ASSETS_REFETCH_INTERVAL,
    staleTime: process.env.IS_TESTING === 'true' ? 0 : 1000,
  });
}
