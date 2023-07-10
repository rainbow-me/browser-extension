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
import { currentAddressStore } from '~/core/state';
import {
  ParsedAddressAsset,
  ParsedAssetsDictByChain,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import {
  fetchAssetBalanceViaProvider,
  filterAsset,
  parseAddressAsset,
} from '~/core/utils/assets';
import { chainIdFromChainName } from '~/core/utils/chains';
import { greaterThan } from '~/core/utils/numbers';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { RainbowError, logger } from '~/logger';
import {
  DAI_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  USDC_MAINNET_ASSET,
} from '~/test/utils';

import { userAssetsQueryKey } from './userAssets';

const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsByChainArgs = {
  address?: Address;
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
    const { currentAddress } = currentAddressStore.getState();
    const chainId = chainIdFromChainName(chain);
    const url = `/${chainId}/${address}/assets/?currency=${currency.toLowerCase()}`;
    const response = await addysHttp.get(url);
    const data = response.data as AddressAssetsReceivedMessage;
    const parsedUserAssetsByUniqueId = parseUserAssetsByChain(data, currency);

    if (connectedToHardhat && chain === ChainName.mainnet) {
      const provider = getProvider({ chainId: ChainId.hardhat });
      // force checking for ETH if connected to hardhat
      parsedUserAssetsByUniqueId[ETH_MAINNET_ASSET.uniqueId] =
        ETH_MAINNET_ASSET;
      if (process.env.IS_TESTING === 'true') {
        parsedUserAssetsByUniqueId[USDC_MAINNET_ASSET.uniqueId] =
          USDC_MAINNET_ASSET;
        parsedUserAssetsByUniqueId[DAI_MAINNET_ASSET.uniqueId] =
          DAI_MAINNET_ASSET;
      }
      const parsePromises = Object.values(parsedUserAssetsByUniqueId).map(
        async (parsedAsset) => {
          if (parsedAsset.chainId !== ChainId.mainnet) return parsedAsset;
          try {
            const _parsedAsset = await fetchAssetBalanceViaProvider({
              parsedAsset,
              currentAddress,
              currency,
              provider,
            });
            return _parsedAsset;
          } catch (e) {
            return parsedAsset;
          }
        },
      );
      const newParsedUserAssetsByUniqueId = await Promise.all(parsePromises);
      const a: Record<string, ParsedAddressAsset> = {};
      newParsedUserAssetsByUniqueId.forEach(
        (parseAsset) => (a[parseAsset.uniqueId] = parseAsset),
      );
      return a;
    } else {
      if (isLowerCaseMatch(data?.meta?.address, address)) {
        return parsedUserAssetsByUniqueId;
      } else {
        return {};
      }
    }
  } catch (e) {
    logger.error(
      new RainbowError(
        `userAssetsByChain.ts - chain: ${chain} - address: ${address}`,
      ),
      {
        message: (e as Error)?.message,
      },
    );
    const cache = queryClient.getQueryCache();
    const cachedUserAssets = cache.find(
      userAssetsQueryKey({ address, currency, connectedToHardhat }),
    )?.state?.data as ParsedAssetsDictByChain;
    const cachedDataForChain = cachedUserAssets[chainIdFromChainName(chain)];
    return cachedDataForChain as Record<string, ParsedAddressAsset>;
  }
}

type UserAssetsByChainResult = QueryFunctionResult<
  typeof userAssetsByChainQueryFunction
>;

function parseUserAssetsByChain(
  message: AddressAssetsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  return Object.values(message?.payload?.assets || {}).reduce(
    (dict, assetData) => {
      const shouldFilterToken = filterAsset(assetData?.asset);
      if (!shouldFilterToken && greaterThan(assetData?.quantity, 0)) {
        const parsedAsset = parseAddressAsset({
          address: assetData?.asset?.asset_code,
          asset: assetData?.asset,
          currency,
          quantity: assetData?.quantity,
        });
        dict[parsedAsset?.uniqueId] = parsedAsset;
      }
      return dict;
    },
    {} as Record<string, ParsedAddressAsset>,
  );
}

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
