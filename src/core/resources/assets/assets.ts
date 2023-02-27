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
import { ParsedAsset, UniqueId } from '~/core/types/assets';
import { AssetPricesReceivedMessage } from '~/core/types/refraction';
import { parseAsset } from '~/core/utils/assets';

const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type AssetsArgs = {
  assetAddresses?: string | string[];
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const assetsQueryKey = ({ assetAddresses, currency }: AssetsArgs) =>
  createQueryKey(
    'assets',
    { assetAddresses, currency },
    { persisterVersion: 1 },
  );

type AssetsQueryKey = ReturnType<typeof assetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function assetsQueryFunction({
  queryKey: [{ assetAddresses, currency }],
}: QueryFunctionArgs<typeof assetsQueryKey>): Promise<{
  [key: UniqueId]: ParsedAsset;
}> {
  const assetCodes = Array.isArray(assetAddresses)
    ? assetAddresses
    : [assetAddresses];
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
      clearTimeout(timeout);
      resolve(parseAssets(message, currency));
    };
    refractionAssetsWs.once(refractionAssetsMessages.ASSETS.RECEIVED, resolver);
  });
}

type AssetsResult = QueryFunctionResult<typeof assetsQueryFunction>;

function parseAssets(
  message: AssetPricesReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  const data = message?.payload?.prices || {};
  console.log('parseAssets ', message?.payload, data);
  const parsed = Object.values(data).reduce((dict, asset) => {
    const parsedAsset = parseAsset({
      address: asset?.asset_code,
      asset: asset,
      currency,
    });
    dict[parsedAsset?.uniqueId] = parsedAsset;
    return dict;
  }, {} as { [key: UniqueId]: ParsedAsset });
  return parsed;
}

// ///////////////////////////////////////////////
// Query Hook

export function useAssets<TSelectData = AssetsResult>(
  { assetAddresses, currency }: AssetsArgs,
  config: QueryConfig<AssetsResult, Error, TSelectData, AssetsQueryKey> = {},
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
