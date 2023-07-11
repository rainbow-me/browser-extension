import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Address } from 'wagmi';

import { refractionAddressWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { currentAddressStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import {
  fetchAssetBalanceViaProvider,
  filterAsset,
  parseAddressAsset,
} from '~/core/utils/assets';
import { greaterThan } from '~/core/utils/numbers';
import { isLowerCaseMatch } from '~/core/utils/strings';
import {
  DAI_MAINNET_ASSET,
  ETH_MAINNET_ASSET,
  USDC_MAINNET_ASSET,
} from '~/test/utils';

const USER_ASSETS_TIMEOUT_DURATION = 10000;
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
  const { currentAddress } = currentAddressStore.getState();

  const isMainnet = chain === ChainName.mainnet;
  const scope = [`${isMainnet ? '' : chain + '-'}assets`];
  const event = `received address ${scope[0]}`;

  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope,
  });

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(
        queryClient.getQueryData(
          userAssetsByChainQueryKey({
            address,
            chain,
            currency,
            connectedToHardhat,
          }),
        ) || {},
      );
    }, USER_ASSETS_TIMEOUT_DURATION);

    const resolver = async (message: AddressAssetsReceivedMessage) => {
      clearTimeout(timeout);
      const parsedUserAssetsByUniqueId = parseUserAssetsByChain(
        message,
        currency,
      );
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
        const pasePromises = Object.values(parsedUserAssetsByUniqueId).map(
          async (parsedAsset) => {
            if (parsedAsset.chainId !== ChainId.mainnet) return parsedAsset;
            try {
              const pa = await fetchAssetBalanceViaProvider({
                parsedAsset,
                currentAddress,
                currency,
                provider,
              });
              return pa;
            } catch (e) {
              return parsedAsset;
            }
          },
        );
        const newParsedUserAssetsByUniqueId = await Promise.all(pasePromises);
        const a: Record<string, ParsedAddressAsset> = {};
        newParsedUserAssetsByUniqueId.forEach(
          (parseAsset) => (a[parseAsset.uniqueId] = parseAsset),
        );
        resolve(a);
      } else {
        if (isLowerCaseMatch(address, message.meta?.address)) {
          resolve(parsedUserAssetsByUniqueId);
        } else {
          resolve({});
        }
      }
    };
    refractionAddressWs.once(event, resolver);
  });
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
