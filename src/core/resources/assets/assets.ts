import { useQuery } from '@tanstack/react-query';

import { refractionAssetsMessages, refractionAssetsWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { AddressOrEth, ParsedAsset, UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AssetPricesReceivedMessage } from '~/core/types/refraction';
import { parseAsset } from '~/core/utils/assets';
import { chainNameFromChainId } from '~/core/utils/chains';

const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type AssetsQueryArgs = {
  assetAddresses: AddressOrEth[];
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const assetsQueryKey = ({ assetAddresses, currency }: AssetsQueryArgs) =>
  createQueryKey(
    'assets',
    { assetAddresses, currency },
    { persisterVersion: 1 },
  );

type AssetsQueryKey = ReturnType<typeof assetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function assetsQueryFunction({
  queryKey: [{ assetAddresses, currency }],
}: QueryFunctionArgs<typeof assetsQueryKey>): Promise<{
  [key: UniqueId]: ParsedAsset;
}> {
  const assetCodes = assetAddresses;
  if (!assetCodes || !assetCodes.length) return {};
  refractionAssetsWs.emit('get', {
    payload: {
      asset_codes: assetCodes,
      currency: currency?.toLowerCase(),
    },
    scope: ['prices'],
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(
        queryClient.getQueryData(
          assetsQueryKey({ assetAddresses, currency }),
        ) || {},
      );
    }, ASSETS_TIMEOUT_DURATION);
    const resolver = (message: AssetPricesReceivedMessage) => {
      if (assetAddresses.length === message.meta?.asset_codes?.length) {
        clearTimeout(timeout);
        resolve(parseAssets({ assetAddresses, currency, message }));
      }
    };
    refractionAssetsWs.once(refractionAssetsMessages.ASSETS.RECEIVED, resolver);
  });
}

type AssetsQueryResult = QueryFunctionResult<typeof assetsQueryFunction>;

// ///////////////////////////////////////////////
// Query Fetcher

export async function fetchAssets(
  { assetAddresses, currency }: AssetsQueryArgs,
  config: QueryConfig<
    AssetsQueryResult,
    Error,
    AssetsQueryResult,
    AssetsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    assetsQueryKey({ assetAddresses, currency }),
    assetsQueryFunction,
    config,
  );
}

function parseAssets({
  assetAddresses,
  currency,
  message,
}: {
  assetAddresses: AddressOrEth[];
  currency: SupportedCurrencyKey;
  message: AssetPricesReceivedMessage;
}) {
  const data = message?.payload?.prices || {};
  const requestedAssets = Object.entries(assetAddresses).map(
    ([chainId, ...addresses]) => ({
      chainId: parseInt(chainId) as ChainId,
      addresses: addresses.flat(),
    }),
  );
  // base assets dict off of params to support requesting same mainnet address on multiple chains
  const parsed = requestedAssets.reduce(
    (dict, { chainId, addresses }) => {
      const assetInfoByChain = addresses.reduce(
        (info, address) => {
          const asset = data[address];
          if (asset) {
            const parsedAsset = parseAsset({
              asset: {
                ...asset,
                network: chainNameFromChainId(chainId),
              },
              currency,
            });
            return {
              ...info,
              [parsedAsset?.uniqueId]: parsedAsset,
            };
          }
          return info;
        },
        {} as { [key: UniqueId]: ParsedAsset },
      );
      return {
        ...dict,
        ...assetInfoByChain,
      };
    },
    {} as { [key: UniqueId]: ParsedAsset },
  );
  return parsed;
}

// ///////////////////////////////////////////////
// Query Hook

export function useAssets<TSelectData = AssetsQueryResult>(
  { assetAddresses, currency }: AssetsQueryArgs,
  config: QueryConfig<
    AssetsQueryResult,
    Error,
    TSelectData,
    AssetsQueryKey
  > = {},
) {
  return useQuery(
    assetsQueryKey({ assetAddresses, currency }),
    assetsQueryFunction,
    {
      ...config,
      refetchInterval: ASSETS_REFETCH_INTERVAL,
    },
  );
}
