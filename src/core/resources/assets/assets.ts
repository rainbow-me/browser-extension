import { useQuery } from '@tanstack/react-query';

import { metadataClient } from '~/core/graphql';
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
import { TokenMetadata, parseAssetMetadata } from '~/core/utils/assets';
import { getErrorMessage } from '~/core/utils/errors';
import { RainbowError, logger } from '~/logger';

export const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const responses = await Promise.all(
      assets.map((asset) =>
        metadataClient.tokenMetadata(
          {
            address: asset.address,
            chainId: asset.chainId,
            currency,
          },
          { timeout: ASSETS_TIMEOUT_DURATION },
        ),
      ),
    );

    const assetsMetadata = responses.flatMap((response, i) =>
      response.token
        ? [{ assetMetadata: response.token, chainId: assets[i].chainId }]
        : [],
    );
    const parsedAssets = parseAssets(assetsMetadata, currency);
    return parsedAssets;
  } catch (e) {
    logger.error(new RainbowError('assetsQueryFunction: '), {
      message: getErrorMessage(e),
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
    assetMetadata: TokenMetadata;
    chainId: ChainId;
  }[],
  currency: SupportedCurrencyKey,
) {
  return assetsMetadata.reduce(
    (assetsDict, { assetMetadata, chainId }) => {
      const address = assetMetadata.networks[chainId]?.address as
        | AddressOrEth
        | undefined;
      if (address) {
        const parsedAsset = parseAssetMetadata({
          address,
          asset: assetMetadata,
          chainId,
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
