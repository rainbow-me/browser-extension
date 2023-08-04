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
import {
  ParsedAddressAsset,
  ParsedAssetsDictByChain,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import { RainbowError, logger } from '~/logger';

import { parseUserAssets, userAssetsQueryKey } from './userAssets';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsByChainArgs = {
  address: Address;
  chainId: ChainId;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
};

// ///////////////////////////////////////////////
// Query Key

export const userAssetsByChainQueryKey = ({
  address,
  chainId,
  currency,
  connectedToHardhat,
}: UserAssetsByChainArgs) =>
  createQueryKey(
    'userAssetsByChain',
    { address, chainId, currency, connectedToHardhat },
    { persisterVersion: 1 },
  );

type UserAssetsByChainQueryKey = ReturnType<typeof userAssetsByChainQueryKey>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchUserAssetsByChain<
  TSelectData = UserAssetsByChainResult,
>(
  { address, chainId, currency, connectedToHardhat }: UserAssetsByChainArgs,
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
      connectedToHardhat,
    }),
    userAssetsByChainQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Function

export async function userAssetsByChainQueryFunction({
  queryKey: [{ address, chainId, currency, connectedToHardhat }],
}: QueryFunctionArgs<typeof userAssetsByChainQueryKey>): Promise<
  Record<string, ParsedAddressAsset>
> {
  const cache = queryClient.getQueryCache();
  const cachedUserAssets = (cache.find(
    userAssetsQueryKey({ address, currency, connectedToHardhat }),
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
        connectedToHardhat,
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
  { address, chainId, currency, connectedToHardhat }: UserAssetsByChainArgs,
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
      connectedToHardhat,
    }),
    userAssetsByChainQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
