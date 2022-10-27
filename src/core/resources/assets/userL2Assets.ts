import { useQuery } from '@tanstack/react-query';
import { mapValues } from 'lodash';
import { Address } from 'wagmi';

import { refractionAddressWs } from '~/core/network';
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
  ZerionL2Asset,
} from '~/core/types/assets';
import { ChainName } from '~/core/types/chains';
import { AddressL2AssetsReceivedMessage } from '~/core/types/refraction';
import {
  getNativeAssetBalance,
  getNativeAssetPrice,
} from '~/core/utils/assets';
import { isL2Chain, isNativeAsset } from '~/core/utils/chains';
import {
  convertAmountToBalanceDisplay,
  convertRawAmountToDecimalFormat,
} from '~/core/utils/numbers';

const USER_L2_ASSETS_TIMEOUT_DURATION = 10000;
const USER_L2_ASSETS_REFETCH_INTERVAL = 60000;

// ///////////////////////////////////////////////
// Query Types

export type UserL2AssetsArgs = {
  address?: Address;
  chain: ChainName;
  currency: SupportedCurrencyKey;
};

// ///////////////////////////////////////////////
// Query Key

const userL2AssetsQueryKey = ({ address, chain, currency }: UserL2AssetsArgs) =>
  createQueryKey(
    'userL2Assets',
    { address, chain, currency },
    { persisterVersion: 1 },
  );

type UserL2AssetsQueryKey = ReturnType<typeof userL2AssetsQueryKey>;

// ///////////////////////////////////////////////
// Query Function

async function userL2AssetsQueryFunction({
  queryKey: [{ address, chain, currency }],
}: QueryFunctionArgs<typeof userL2AssetsQueryKey>): Promise<
  Record<string, ParsedAddressAsset>
> {
  refractionAddressWs.emit('get', {
    payload: {
      address,
      currency: currency?.toLowerCase(),
    },
    scope: [`${chain}-assets`],
  });
  const event = `received address ${chain}-assets`;
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      refractionAddressWs.removeEventListener(event, resolver);
      resolve(
        queryClient.getQueryData(
          userL2AssetsQueryKey({ address, chain, currency }),
        ) || {},
      );
    }, USER_L2_ASSETS_TIMEOUT_DURATION);
    const resolver = (message: AddressL2AssetsReceivedMessage) => {
      clearTimeout(timeout);
      refractionAddressWs.removeEventListener(event, resolver);
      resolve(parseUserL2Assets(message, currency));
    };
    refractionAddressWs.on(event, resolver);
  });
}

type UserL2AssetsResult = QueryFunctionResult<typeof userL2AssetsQueryFunction>;

export const parseUserAsset = ({
  address,
  asset,
  currency,
  quantity,
}: {
  address: Address;
  asset: ZerionL2Asset;
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
    chainName: asset?.network,
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

function parseUserL2Assets(
  message: AddressL2AssetsReceivedMessage,
  currency: SupportedCurrencyKey,
) {
  console.log('L2 MESSAGE OBJECT: ', message);
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

export function useUserL2Assets(
  { address, chain, currency }: UserL2AssetsArgs,
  config: QueryConfig<UserL2AssetsResult, Error, UserL2AssetsQueryKey> = {},
) {
  return useQuery(
    userL2AssetsQueryKey({ address, chain, currency }),
    userL2AssetsQueryFunction,
    {
      ...config,
      refetchInterval: USER_L2_ASSETS_REFETCH_INTERVAL,
    },
  );
}
