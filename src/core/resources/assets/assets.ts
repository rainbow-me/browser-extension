import { useQuery } from '@tanstack/react-query';

import { requestMetadata } from '~/core/graphql';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import {
  AddressOrEth,
  AssetMetadata,
  ParsedAsset,
  UniqueId,
} from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  chunkArray,
  createAssetQuery,
  parseAssetMetadata,
} from '~/core/utils/assets';
import { RainbowError, logger } from '~/logger';

const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type AssetsQueryArgs = {
  assetAddresses: AddressOrEth[];
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
  try {
    if (!assetAddresses || !assetAddresses.length) return {};
    const batches = chunkArray([...assetAddresses], 10); // chunking because a full batch would throw 413
    const batchResults = batches.map((batchedQuery) =>
      requestMetadata(createAssetQuery(batchedQuery, chainId, currency), {
        timeout: ASSETS_TIMEOUT_DURATION,
      }),
    ) as Promise<Record<string, AssetMetadata>[]>[];
    const results = (await Promise.all(batchResults))
      .flat()
      .map((r) => Object.values(r))
      .flat();
    const parsedAssets = parseAssets(results, chainId, currency);
    return parsedAssets;
  } catch (e) {
    logger.error(new RainbowError('assetsQueryFunction: '), {
      message: (e as Error)?.message,
    });
    return {};
  }
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

function parseAssets(
  assets: AssetMetadata[],
  chainId: ChainId,
  currency: SupportedCurrencyKey,
) {
  return assets.reduce((assetsDict, asset) => {
    const address = asset.networks?.[chainId]?.address;
    if (address) {
      const parsedAsset = parseAssetMetadata({
        address,
        asset,
        chainId,
        currency,
      });
      assetsDict[parsedAsset?.uniqueId] = parsedAsset;
    }
    return assetsDict;
  }, {} as Record<UniqueId, ParsedAsset>);
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
