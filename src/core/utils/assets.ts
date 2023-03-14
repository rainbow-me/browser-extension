import isURL from 'validator/lib/isURL';
import { Address } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import {
  AssetType,
  ParsedAddressAsset,
  ParsedAsset,
  ParsedSearchAsset,
  UniqueId,
  ZerionAsset,
  ZerionAssetPrice,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';

import { SearchAsset } from '../types/search';

import {
  chainIdFromChainName,
  chainNameFromChainId,
  isNativeAsset,
} from './chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
  convertAmountToNativeDisplay,
  convertAmountToPercentageDisplay,
  convertRawAmountToDecimalFormat,
} from './numbers';

const get24HrChange = (priceData?: ZerionAssetPrice) => {
  const twentyFourHrChange = priceData?.relative_change_24h;
  return twentyFourHrChange
    ? convertAmountToPercentageDisplay(twentyFourHrChange)
    : '';
};

export const getNativeAssetPrice = ({
  priceData,
  currency,
}: {
  priceData?: ZerionAssetPrice;
  currency: SupportedCurrencyKey;
}) => {
  const priceUnit = priceData?.value;
  return {
    change: get24HrChange(priceData),
    amount: priceUnit || 0,
    display: convertAmountToNativeDisplay(priceUnit || 0, currency),
  };
};

export const getNativeAssetBalance = ({
  currency,
  priceUnit,
  value,
}: {
  currency: SupportedCurrencyKey;
  decimals: number;
  priceUnit: number;
  value: string | number;
}) => {
  return convertAmountAndPriceToNativeDisplay(value, priceUnit, currency);
};

export function parseAsset({
  address,
  asset,
  currency,
}: {
  address: Address;
  asset: ZerionAsset;
  currency: SupportedCurrencyKey;
}): ParsedAsset {
  const chainName = asset?.network ?? ChainName.mainnet;
  const chainId = chainIdFromChainName(chainName);
  const mainnetAddress = asset?.mainnet_address;
  const uniqueId: UniqueId = `${mainnetAddress || address}_${chainId}`;
  const parsedAsset = {
    address,
    colors: asset?.colors,
    chainId,
    chainName,
    isNativeAsset: isNativeAsset(address, chainIdFromChainName(chainName)),
    name: asset?.name,
    mainnetAddress,
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData: asset?.price,
      }),
    },
    price: asset?.price,
    symbol: asset?.symbol,
    type: asset?.type ?? AssetType.token,
    uniqueId,
    decimals: asset?.decimals,
    icon_url: asset?.icon_url,
  };

  return parsedAsset;
}

export function parseAddressAsset({
  address,
  asset,
  currency,
  quantity,
}: {
  address: Address;
  asset: ZerionAsset;
  currency: SupportedCurrencyKey;
  quantity: string;
}): ParsedAddressAsset {
  const amount = convertRawAmountToDecimalFormat(quantity, asset?.decimals);
  const parsedAsset = parseAsset({
    address,
    asset,
    currency,
  });
  return {
    ...parsedAsset,
    balance: {
      amount,
      display: convertAmountToBalanceDisplay(amount, {
        decimals: asset?.decimals,
        symbol: asset?.symbol,
      }),
    },
    native: {
      ...parsedAsset.native,
      balance: getNativeAssetBalance({
        currency,
        decimals: asset?.decimals,
        priceUnit: asset?.price?.value || 0,
        value: amount,
      }),
    },
  };
}

export function parseParsedAddressAsset({
  parsedAsset,
  currency,
  quantity,
}: {
  parsedAsset: ParsedAddressAsset;
  currency: SupportedCurrencyKey;
  quantity: string;
}): ParsedAddressAsset {
  const amount = convertRawAmountToDecimalFormat(
    quantity,
    parsedAsset?.decimals,
  );
  return {
    ...parsedAsset,
    balance: {
      amount,
      display: convertAmountToBalanceDisplay(amount, {
        decimals: parsedAsset?.decimals,
        symbol: parsedAsset?.symbol,
      }),
    },
    native: {
      ...parsedAsset.native,
      balance: getNativeAssetBalance({
        currency,
        decimals: parsedAsset?.decimals,
        priceUnit: parsedAsset?.price?.value || 0,
        value: amount,
      }),
    },
  };
}

export const parseSearchAsset = ({
  chainId,
  assetWithPrice,
  userAsset,
  searchAsset,
}: {
  assetWithPrice?: ParsedAsset;
  userAsset?: ParsedAddressAsset;
  chainId: ChainId;
  searchAsset: ParsedSearchAsset | SearchAsset;
}): ParsedSearchAsset => {
  const assetNetworkInformation = searchAsset?.networks?.[chainId];
  // if searchAsset is appearing because it found an exact match
  // "on other networks" we need to take the first network, decimals and address to
  // use for the asset

  const networks = Object.entries(searchAsset?.networks || {});
  const assetInOneNetwork = networks.length === 1;
  console.log('--- assetNetworkInformation', assetNetworkInformation);
  const address = assetInOneNetwork
    ? networks?.[0]?.[1].address
    : assetNetworkInformation?.address ||
      userAsset?.address ||
      assetWithPrice?.address ||
      searchAsset?.address;

  const decimals =
    userAsset?.decimals ||
    assetNetworkInformation?.decimals ||
    assetWithPrice?.decimals ||
    0;
  const assetChainId = assetInOneNetwork ? Number(networks[0][0]) : chainId;

  console.log('--- -userAsset', userAsset);
  console.log('--- -assetInOneNetwork', assetInOneNetwork);
  console.log('--- -networks', networks);
  console.log('--- -assetNetworkInformation', assetNetworkInformation);
  console.log('--- -assetWithPrice', assetWithPrice);

  return {
    ...(assetWithPrice || {}),
    ...searchAsset,
    decimals,
    address,
    chainId: assetChainId,
    native: {
      balance: userAsset?.native.balance || {
        amount: '0',
        display: '0.00',
      },
      price: assetWithPrice?.native.price,
    },
    balance: userAsset?.balance || { amount: '0', display: '0.00' },
    icon_url:
      userAsset?.icon_url || assetWithPrice?.icon_url || searchAsset?.icon_url,
    colors: searchAsset?.colors || assetWithPrice?.colors,
    chainName: chainNameFromChainId(assetChainId),
  };
};

export function filterAsset(asset: ZerionAsset) {
  const nameFragments = asset?.name?.split(' ');
  const nameContainsURL = nameFragments.some((f) => isURL(f));
  const symbolFragments = asset?.symbol?.split(' ');
  const symbolContainsURL = symbolFragments.some((f) => isURL(f));
  const shouldFilter = nameContainsURL || symbolContainsURL;
  return shouldFilter;
}
