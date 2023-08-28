import { useQuery } from '@tanstack/react-query';
import { Address } from 'wagmi';

import { requestMetadata } from '~/core/graphql';
import { refractionAssetsMessages, refractionAssetsWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { AssetMetadata, ParsedAsset, UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AssetPricesReceivedMessage } from '~/core/types/refraction';
import { parseAsset } from '~/core/utils/assets';

import { createAssetQuery } from './helpers';

const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type AssetsQueryArgs = {
  assetAddresses: Address[];
  chainId: ChainId;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const assetsQueryKey = ({
  assetAddresses,
  chainId,
  currency,
}: AssetsQueryArgs) =>
  createQueryKey(
    'assets',
    { assetAddresses, chainId, currency },
    { persisterVersion: 2 },
  );

type AssetsQueryKey = ReturnType<typeof assetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

export async function assetsQueryFunction({
  queryKey: [{ assetAddresses, chainId, currency }],
}: QueryFunctionArgs<typeof assetsQueryKey>): Promise<{
  [key: UniqueId]: ParsedAsset;
}> {
  const assetCodes = assetAddresses;
  if (!assetCodes || !assetCodes.length) return {};
  function chunkArray(arr: Address[], chunkSize: number) {
    const result = [];

    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }

    return result;
  }
  const batches = chunkArray([...assetAddresses], 10); // chunking because a full batch would throw 413
  const batchResults = batches.map((batchedQuery) =>
    requestMetadata(createAssetQuery(batchedQuery, currency)),
  ) as Promise<Record<string, AssetMetadata>[]>[];
  const foo = await (await Promise.all(batchResults)).flat();
  console.log('FOO: ', foo);
  refractionAssetsWs.emit('get', {
    payload: {
      asset_codes: assetCodes,
      currency: currency?.toLowerCase(),
    },
    scope: ['prices'],
  });
  return new Promise((resolve) => {
    const resolver = (message: AssetPricesReceivedMessage) => {
      if (assetAddresses.length === message.meta?.asset_codes?.length) {
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
  { assetAddresses, chainId, currency }: AssetsQueryArgs,
  config: QueryConfig<
    AssetsQueryResult,
    Error,
    AssetsQueryResult,
    AssetsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery(
    assetsQueryKey({ assetAddresses, chainId, currency }),
    assetsQueryFunction,
    config,
  );
}

function parseAssetsTwo() {}

function parseAssets({
  assetAddresses,
  currency,
  message,
}: {
  assetAddresses: Address[];
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
  const parsed = requestedAssets.reduce((dict, { addresses }) => {
    const assetInfoByChain = addresses.reduce((info, address) => {
      const asset = data[address];
      if (asset) {
        const parsedAsset = parseAsset({
          address: asset?.asset_code,
          asset: {
            ...asset,
            mainnet_address: asset?.asset_code,
          },
          currency,
        });
        return {
          ...info,
          [parsedAsset?.uniqueId]: parsedAsset,
        };
      }
      return info;
    }, {} as { [key: UniqueId]: ParsedAsset });
    return {
      ...dict,
      ...assetInfoByChain,
    };
  }, {} as { [key: UniqueId]: ParsedAsset });
  return parsed;
}

// ///////////////////////////////////////////////
// Query Hook

export function useAssets<TSelectData = AssetsQueryResult>(
  { assetAddresses, chainId, currency }: AssetsQueryArgs,
  config: QueryConfig<
    AssetsQueryResult,
    Error,
    TSelectData,
    AssetsQueryKey
  > = {},
) {
  return useQuery(
    assetsQueryKey({ assetAddresses, chainId, currency }),
    assetsQueryFunction,
    {
      ...config,
      refetchInterval: ASSETS_REFETCH_INTERVAL,
    },
  );
}
