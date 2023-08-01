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
import { ChainName } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import { chainIdFromChainName } from '~/core/utils/chains';
import { RainbowError, logger } from '~/logger';

import { parseUserAssets, userAssetsQueryKey } from './userAssets';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsByChainArgs = {
  address: Address;
  chain: ChainName;
  currency: SupportedCurrencyKey;
  connectedToHardhat: boolean;
};

// ///////////////////////////////////////////////
// Query Key

export const userAssetsByChainQueryKey = ({
  address,
  chain,
  currency,
  connectedToHardhat,
}: UserAssetsByChainArgs) =>
  createQueryKey(
    'userAssetsByChain',
    { address, chain, currency, connectedToHardhat },
    { persisterVersion: 1 },
  );

type UserAssetsByChainQueryKey = ReturnType<typeof userAssetsByChainQueryKey>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchUserAssetsByChain<
  TSelectData = UserAssetsByChainResult,
>(
  { address, chain, currency, connectedToHardhat }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectData,
    UserAssetsByChainQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    userAssetsByChainQueryKey({ address, chain, currency, connectedToHardhat }),
    userAssetsByChainQueryFunction,
    config,
  );
}

// ///////////////////////////////////////////////
// Query Function

export async function userAssetsByChainQueryFunction({
  queryKey: [{ address, chain, currency, connectedToHardhat }],
}: QueryFunctionArgs<typeof userAssetsByChainQueryKey>): Promise<
  Record<string, ParsedAddressAsset>
> {
  try {
    const chainId = chainIdFromChainName(chain);
    const cache = queryClient.getQueryCache();
    const cachedUserAssets = cache.find(
      userAssetsQueryKey({ address, currency, connectedToHardhat }),
    )?.state?.data as ParsedAssetsDictByChain;
    const cachedDataForChain = cachedUserAssets?.[chainIdFromChainName(chain)];
    const url = `/${chainId}/${address}/assets/?currency=${currency.toLowerCase()}`;
    const res = await addysHttp.get<AddressAssetsReceivedMessage>(url);
    const chainIdsInResponse = res?.data?.meta?.chain_ids;
    const assets = res?.data?.payload?.assets || [];
    if (Array.isArray(assets) && chainIdsInResponse) {
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
      new RainbowError(`userAssetsByChainQueryFunction - chain = ${chain}:`),
      {
        message: (e as Error)?.message,
      },
    );
    const cache = queryClient.getQueryCache();
    const cachedUserAssets = cache.find(
      userAssetsQueryKey({ address, currency, connectedToHardhat }),
    )?.state?.data as ParsedAssetsDictByChain;
    const cachedDataForChain = cachedUserAssets?.[chainIdFromChainName(chain)];
    return (cachedDataForChain as Record<string, ParsedAddressAsset>) || {};
  }
}

type UserAssetsByChainResult = QueryFunctionResult<
  typeof userAssetsByChainQueryFunction
>;

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssetsByChain<TSelectResult = UserAssetsByChainResult>(
  { address, chain, currency, connectedToHardhat }: UserAssetsByChainArgs,
  config: QueryConfig<
    UserAssetsByChainResult,
    Error,
    TSelectResult,
    UserAssetsByChainQueryKey
  > = {},
) {
  return useQuery(
    userAssetsByChainQueryKey({ address, chain, currency, connectedToHardhat }),
    userAssetsByChainQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
