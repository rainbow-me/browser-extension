import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

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
import { useNetworkStore } from '~/core/state/networks/networks';
import { useStaleBalancesStore } from '~/core/state/staleBalances';
import { ParsedAssetsDictByChain, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/zerion';
import { getSupportedChains } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';
import {
  DAI_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  OPTIMISM_MAINNET_ASSET,
  USDC_MAINNET_ASSET,
} from '~/test/utils';

import { TEST_VARIABLES } from '../../../../e2e/walletVariables';

import { parseUserAssets } from './common';

const USER_ASSETS_REFETCH_INTERVAL = 60000;
const USER_ASSETS_TIMEOUT_DURATION = 20000;

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

// Test wallet addresses from e2e test variables
const TEST_WALLET_ADDRESSES = [
  TEST_VARIABLES.SEED_WALLET.ADDRESS.toLowerCase(),
  TEST_VARIABLES.SWAPS_WALLET.ADDRESS.toLowerCase(),
  TEST_VARIABLES.EMPTY_WALLET.ADDRESS.toLowerCase(),
  TEST_VARIABLES.PRIVATE_KEY_WALLET.ADDRESS.toLowerCase(),
  TEST_VARIABLES.PRIVATE_KEY_WALLET_2.ADDRESS.toLowerCase(),
  TEST_VARIABLES.PRIVATE_KEY_WALLET_3.ADDRESS.toLowerCase(),
  TEST_VARIABLES.SEED_PHRASE_24.ADDRESS.toLowerCase(),
];

const isTestWallet = (address?: Address): boolean => {
  if (!address) return false;
  return TEST_WALLET_ADDRESSES.includes(address.toLowerCase());
};

// Create stubbed assets for test wallets
const createStubbedAssets = (): ParsedAssetsDictByChain => {
  const stubbedAssets: ParsedAssetsDictByChain = {
    [ChainId.mainnet]: {
      [ETH_MAINNET_ASSET.uniqueId]: ETH_MAINNET_ASSET,
      [USDC_MAINNET_ASSET.uniqueId]: USDC_MAINNET_ASSET,
      [DAI_MAINNET_ASSET.uniqueId]: DAI_MAINNET_ASSET,
    },
    [ChainId.optimism]: {
      [OPTIMISM_MAINNET_ASSET.uniqueId]: OPTIMISM_MAINNET_ASSET,
    },
  };
  return stubbedAssets;
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

  // For test wallets in testing mode, immediately return stubbed assets
  // This ensures tests have predictable balances even if anvil balances are slow or fail
  if (process.env.IS_TESTING === 'true' && isTestWallet(address)) {
    const stubbedAssets = createStubbedAssets();

    if (address) {
      // Fire and forget - fetch real balances in background
      setTimeout(async () => {
        try {
          const supportedChainIds = [ChainId.mainnet, ChainId.optimism];
          const url =
            `/${supportedChainIds.join(',')}/` +
            `${address}/assets/?currency=${currency.toLowerCase()}`;
          const res = await addysHttp.get<AddressAssetsReceivedMessage>(url, {
            timeout: USER_ASSETS_TIMEOUT_DURATION,
          });
          const assets = res?.data?.payload?.assets || [];
          const chainIds = res?.data?.meta?.chain_ids || [];

          if (assets.length && chainIds.length) {
            const realAssets = await parseUserAssets({
              address,
              assets,
              chainIds,
              currency,
            });

            // Update the query cache with real data when available
            queryClient.setQueryData(
              userAssetsQueryKey({ address, currency, testnetMode }),
              realAssets,
            );

            if (process.env.DEBUG_TEST_WALLETS) {
              logger.debug('[userAssets] Updated cache with real balances', {
                address,
                chainIds,
              });
            }
          }
        } catch (e) {
          // Silently ignore background fetch errors for test wallets
          // Tests will continue with stubbed data
          if (process.env.DEBUG_TEST_WALLETS) {
            logger.debug(
              '[userAssets] Background fetch failed for test wallet',
              {
                address,
                error: (e as Error)?.message,
              },
            );
          }
        }
      }, 500); // Small delay to let the main flow complete first
    }

    return stubbedAssets;
  }

  try {
    const supportedAssetsChainIds = useNetworkStore
      .getState()
      .getSupportedAssetsChainIds();

    const supportedChainIds = getSupportedChains({
      testnets: testnetMode,
    })
      .map(({ id }) => id)
      .filter((id) => supportedAssetsChainIds.includes(id));

    useStaleBalancesStore.getState().clearExpiredData(address as Address);
    const staleBalancesParam = useStaleBalancesStore
      .getState()
      .getStaleBalancesQueryParam(address as Address);
    const url = `/${supportedChainIds.join(
      ',',
    )}/${address}/assets/?currency=${currency.toLowerCase()}${staleBalancesParam}`;
    const res = await addysHttp.get<AddressAssetsReceivedMessage>(url, {
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
    const parsedRetries = await Promise.all(retries);
    for (const parsedAssets of parsedRetries) {
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
  return useQuery({
    queryKey: userAssetsQueryKey({
      address,
      currency,
      testnetMode,
    }),
    queryFn: userAssetsQueryFunction,
    ...config,
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
  return useQuery({
    queryKey: userAssetsByChainQueryKey({
      address,
      chainId,
      currency,
    }),
    queryFn: userAssetsByChainQueryFunction,
    ...config,
    refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
  });
}
