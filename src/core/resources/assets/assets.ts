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
import { createAssetQuery, parseAssetMetadata } from '~/core/utils/assets';
import { RainbowError, logger } from '~/logger';

export const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

type AssetsQueryArgs = {
  assets: { address: AddressOrEth; chainId: ChainId }[];
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const assetsQueryKey = ({ assets, currency }: AssetsQueryArgs) =>
  createQueryKey('assets', { assets, currency }, { persisterVersion: 3 });

type AssetsQueryKey = ReturnType<typeof assetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function assetsQueryFunction({
  queryKey: [{ assets, currency }],
}: QueryFunctionArgs<typeof assetsQueryKey>): Promise<{
  [key: UniqueId]: ParsedAsset;
}> {
  try {
    if (!assets || !assets.length) return {};
    const batches = assets.map((asset) =>
      requestMetadata(
        createAssetQuery([asset.address], asset.chainId, currency, true),
        {
          timeout: ASSETS_TIMEOUT_DURATION,
        },
      ),
    ) as Promise<Record<string, AssetMetadata>[]>[];

    const results = (await Promise.all(batches))
      .flat()
      .map((r) => Object.values(r))
      .flat();
    const assetsMetadata = results.map((assetMetadata, i) => ({
      assetMetadata,
      chainId: assets[i].chainId,
    }));
    const parsedAssets = parseAssets(assetsMetadata, currency);
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchAssets(
  { assets, currency }: AssetsQueryArgs,
  config: QueryConfig<
    AssetsQueryResult,
    Error,
    AssetsQueryResult,
    AssetsQueryKey
  > = {},
) {
  return await queryClient.fetchQuery({
    queryKey: assetsQueryKey({ assets, currency }),
    queryFn: assetsQueryFunction,
    ...config,
  });
}

function parseAssets(
  assetsMetadata: {
    assetMetadata: AssetMetadata;
    chainId: ChainId;
  }[],
  currency: SupportedCurrencyKey,
) {
  return assetsMetadata.reduce(
    (assetsDict, assetMetadata) => {
      const address =
        assetMetadata.assetMetadata.networks?.[assetMetadata.chainId]?.address;
      if (address) {
        const parsedAsset = parseAssetMetadata({
          address,
          asset: assetMetadata.assetMetadata,
          chainId: assetMetadata.chainId,
          currency,
        });
        assetsDict[parsedAsset?.chainId] = parsedAsset;
      }
      return assetsDict;
    },
    {} as Record<UniqueId, ParsedAsset>,
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useAssets<TSelectData = AssetsQueryResult>(
  { assets, currency }: AssetsQueryArgs,
  config: QueryConfig<
    AssetsQueryResult,
    Error,
    TSelectData,
    AssetsQueryKey
  > = {},
) {
  return useQuery({
    queryKey: assetsQueryKey({ assets, currency }),
    queryFn: assetsQueryFunction,
    ...config,
    refetchInterval: ASSETS_REFETCH_INTERVAL,
  });
}
