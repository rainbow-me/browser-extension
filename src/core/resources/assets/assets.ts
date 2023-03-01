import { useQuery } from '@tanstack/react-query';

import { refractionAssetsWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import { ParsedAsset, UniqueId } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { AssetPricesReceivedMessage } from '~/core/types/refraction';
import { parseAsset } from '~/core/utils/assets';
import { chainNameFromChainId } from '~/core/utils/chains';

const ASSETS_TIMEOUT_DURATION = 10000;
const ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type AssetsArgs = {
  assetAddresses: Record<ChainId, string[]>;
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
} | void> {
  const assetCodes = Object.values(assetAddresses || {}).flat();
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
      clearTimeout(timeout);
      resolve(parseAssets({ assetAddresses, currency, message }));
    };
    refractionAssetsWs.once('received assets prices', resolver);
  });
}

type AssetsResult = QueryFunctionResult<typeof assetsQueryFunction>;

function parseAssets({
  assetAddresses,
  currency,
  message,
}: {
  assetAddresses: Record<ChainId, string[]>;
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
  const parsed = requestedAssets.reduce((dict, { chainId, addresses }) => {
    const assetInfoByChain = addresses.reduce((info, address) => {
      const asset = data[address];
      if (asset) {
        const parsedAsset = parseAsset({
          address: asset?.asset_code,
          asset: {
            ...asset,
            network: chainNameFromChainId(chainId),
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
