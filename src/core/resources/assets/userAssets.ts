import { useQuery } from '@tanstack/react-query';
import { mapValues } from 'lodash';
import { Address } from 'wagmi';

import { refractionAddressMessages, refractionAddressWs } from '~/core/network';
import {
  QueryConfig,
  QueryFunctionArgs,
  QueryFunctionResult,
  createQueryKey,
  queryClient,
} from '~/core/react-query';
import { SupportedCurrencyKey } from '~/core/references';
import {
  AssetType,
  ParsedAddressAsset,
  ZerionAsset,
} from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import { AddressAssetsReceivedMessage } from '~/core/types/refraction';
import {
  getNativeAssetBalance,
  getNativeAssetPrice,
} from '~/core/utils/assets';
import { isL2Chain, isNativeAsset } from '~/core/utils/chains';
import {
  convertAmountToBalanceDisplay,
  convertRawAmountToDecimalFormat,
} from '~/core/utils/numbers';

const USER_ASSETS_TIMEOUT_DURATION = 10000;
const USER_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserAssetsArgs = {
  address?: Address;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const userAssetsQueryKey = ({ address, currency }: UserAssetsArgs) =>
  createQueryKey('userAssets', { address, currency }, { persisterVersion: 1 });

type UserAssetsQueryKey = ReturnType<typeof userAssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function userAssetsQueryFunction({
  queryKey: [{ address, currency }],
}: QueryFunctionArgs<typeof userAssetsQueryKey>): Promise<
  Record<string, ParsedAddressAsset>
> {
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope: ['assets'],
  });
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      refractionAddressWs.removeListener(
        refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
        resolver,
      );
      resolve(
        queryClient.getQueryData(userAssetsQueryKey({ address, currency })) ||
          {},
      );
    }, USER_ASSETS_TIMEOUT_DURATION);
    const resolver = (message: AddressAssetsReceivedMessage) => {
      console.log('message in resolver: ', message);
      clearTimeout(timeout);
      refractionAddressWs.removeListener(
        refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
        resolver,
      );
      resolve(parseUserAssets(message, currency));
    };
    refractionAddressWs.on(
      refractionAddressMessages.ADDRESS_ASSETS.RECEIVED,
      resolver,
    );
  });
}

type UserAssetsResult = QueryFunctionResult<typeof userAssetsQueryFunction>;

export const parseUserAsset = ({
  address,
  asset,
  currency,
  quantity,
}: {
  address: Address;
  asset: ZerionAsset;
  currency: SupportedCurrencyKey;
  quantity: string;
}): ParsedAddressAsset => {
  const type =
    asset.type === AssetType.uniswap ||
    asset.type === AssetType.uniswapV2 ||
    asset.type === AssetType.arbitrum ||
    asset.type === AssetType.bsc ||
    asset.type === AssetType.optimism ||
    asset.type === AssetType.polygon
      ? asset.type
      : AssetType.token;
  const chainName = (isL2Chain(type) ? type : ChainName.mainnet) as ChainName;
  const uniqueId =
    chainName === ChainName.mainnet ? address : `${address}_${chainName}`;
  const amount = convertRawAmountToDecimalFormat(quantity, asset?.decimals);
  const parsedAsset = {
    address,
    balance: {
      amount,
      display: convertAmountToBalanceDisplay(amount, {
        decimals: asset?.decimals,
        symbol: asset?.symbol,
      }),
    },
    chainName,
    isNativeAsset: isNativeAsset(address, chainName),
    name: asset?.name,
    native: {
      balance: getNativeAssetBalance({
        currency,
        decimals: asset?.decimals,
        priceUnit: asset?.price?.value || 0,
        value: amount,
      }),
      price: getNativeAssetPrice({
        currency,
        priceData: asset?.price,
      }),
    },
    price: asset?.price,
    symbol: asset?.symbol,
    type,
    uniqueId,
  };

  return parsedAsset;
};

function parseUserAssets(
  message: AddressAssetsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  return mapValues(message?.payload?.assets || {}, (assetData, address) =>
    parseUserAsset({
      address: address as Address,
      asset: assetData?.asset,
      currency,
      quantity: assetData?.quantity,
    }),
  );
}

// ///////////////////////////////////////////////
// Query Hook

export function useUserAssets(
  { address, currency }: UserAssetsArgs,
  config: QueryConfig<UserAssetsResult, Error, UserAssetsQueryKey> = {},
) {
  return useQuery(
    userAssetsQueryKey({ address, currency }),
    userAssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_ASSETS_REFETCH_INTERVAL,
    },
  );
}
