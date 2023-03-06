import { Contract } from '@ethersproject/contracts';
import { useQuery } from '@tanstack/react-query';
import { getProvider } from '@wagmi/core';
import { Address, erc20ABI } from 'wagmi';

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
  filterAsset,
  parseAddressAsset,
  parseParsedAddressAsset,
} from '~/core/utils/assets';
import { greaterThan } from '~/core/utils/numbers';
import { ETH_MAINNET_ASSET } from '~/test/utils';

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
      const parsedUserAssetsByChain = parseUserAssetsByChain(message, currency);
      if (connectedToHardhat && chain === ChainName.mainnet) {
        const provider = getProvider({ chainId: ChainId.hardhat });
        // force checking for ETH if connected to hardhat
        parsedUserAssetsByChain[ETH_MAINNET_ASSET.uniqueId] = ETH_MAINNET_ASSET;
        Object.values(parsedUserAssetsByChain).forEach(async (parsedAsset) => {
          if (parsedAsset.chainId !== ChainId.mainnet) return parsedAsset;
          try {
            if (parsedAsset.isNativeAsset) {
              const balance = await provider.getBalance(currentAddress);
              const updatedAsset = parseParsedAddressAsset({
                parsedAsset,
                currency,
                quantity: balance.toString(),
              });
              parsedUserAssetsByChain[parsedAsset.uniqueId] = updatedAsset;
            } else {
              const contract = new Contract(
                parsedAsset.address,
                erc20ABI,
                provider,
              );
              const balance = await contract.balanceOf(currentAddress);
              const updatedAsset = parseParsedAddressAsset({
                parsedAsset,
                currency,
                quantity: balance.toString(),
              });
              parsedUserAssetsByChain[parsedAsset.uniqueId] = updatedAsset;
            }
          } catch (e) {
            return parsedAsset;
          }
        });
      }
      resolve(parsedUserAssetsByChain);
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
