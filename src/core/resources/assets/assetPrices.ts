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
import { RainbowPrices, ZerionAsset } from '~/core/types/assets';
import { AssetPricesReceivedMessage } from '~/core/types/refraction';
import {
  convertAmountToNativeDisplay,
  convertAmountToPercentageDisplay,
} from '~/core/utils/numbers';

const ASSET_PRICES_TIMEOUT_DURATION = 10000;
const ASSET_PRICES_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type AssetPricesArgs = {
  assetAddresses?: string | string[];
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const assetPricesQueryKey = ({ assetAddresses, currency }: AssetPricesArgs) =>
  createQueryKey(
    'assetPrices',
    { assetAddresses, currency },
    { persisterVersion: 1 },
  );

type AssetPricesQueryKey = ReturnType<typeof assetPricesQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function assetPricesQueryFunction({
  queryKey: [{ assetAddresses, currency }],
}: QueryFunctionArgs<
  typeof assetPricesQueryKey
>): Promise<AssetPricesReceivedMessage> {
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
      refractionAssetsWs.removeEventListener(
        refractionAssetsMessages.ASSETS.RECEIVED,
        resolver,
      );
      resolve(
        queryClient.getQueryData(
          assetPricesQueryKey({ assetAddresses, currency }),
        ) || {},
      );
    }, ASSET_PRICES_TIMEOUT_DURATION);
    const resolver = (message: AssetPricesReceivedMessage) => {
      clearTimeout(timeout);
      refractionAssetsWs.removeEventListener(
        refractionAssetsMessages.ASSETS.RECEIVED,
        resolver,
      );
      resolve(parseAssetPrices(message, currency));
    };
    refractionAssetsWs.on(refractionAssetsMessages.ASSETS.RECEIVED, resolver);
  });
}

type AssetPricesResult = QueryFunctionResult<typeof assetPricesQueryFunction>;

function parseAssetPrices(
  message: AssetPricesReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  const data = message?.payload?.prices || {};
  const get24HrChange = (asset: ZerionAsset) => {
    const twentyFourHrChange = asset?.price?.relative_change_24h;
    return twentyFourHrChange
      ? convertAmountToPercentageDisplay(twentyFourHrChange)
      : '';
  };
  const parsed = Object.entries(data).reduce(
    (parsedDict, [address, priceData]) => {
      const priceUnit = priceData?.price?.value;
      parsedDict[address] = {
        change: get24HrChange(priceData),
        price: {
          amount: priceUnit,
          display: convertAmountToNativeDisplay(priceUnit || 0, currency),
        },
      };
      return parsedDict;
    },
    {} as RainbowPrices,
  );
  return parsed;
}

// ///////////////////////////////////////////////
// Query Hook

export function useAssetPrices(
  { assetAddresses, currency }: AssetPricesArgs,
  config: QueryConfig<AssetPricesResult, Error, AssetPricesQueryKey> = {},
) {
  return useQuery(
    assetPricesQueryKey({ assetAddresses, currency }),
    assetPricesQueryFunction,
    {
      ...config,
      refetchInterval: ASSET_PRICES_REFETCH_INTERVAL,
    },
  );
}
