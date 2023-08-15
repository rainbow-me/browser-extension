import { Provider } from '@ethersproject/providers';
import isURL from 'validator/lib/isURL';
import { Address, erc20ABI } from 'wagmi';
import { getContract } from 'wagmi/actions';

import { SupportedCurrencyKey } from '~/core/references';
import {
  AssetType,
  ParsedAsset,
  ParsedSearchAsset,
  UniqueId,
  ZerionAsset,
  ZerionAssetPrice,
} from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';

import { i18n } from '../languages';
import { SearchAsset } from '../types/search';
import { Asset } from '../types/transactions';

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
  asset,
  currency,
}: {
  asset: Asset;
  currency: SupportedCurrencyKey;
}): ParsedAsset {
  const address = asset.asset_code;
  const chainName = asset.network ?? ChainName.mainnet;
  const chainId = chainIdFromChainName(chainName);
  const mainnetAddress = asset.networks?.[ChainId.mainnet]?.address;
  const uniqueId: UniqueId = `${mainnetAddress || address}_${chainId}`;
  const parsedAsset = {
    address,
    uniqueId,
    chainId,
    chainName,
    mainnetAddress,
    isNativeAsset: isNativeAsset(address, chainIdFromChainName(chainName)),
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData: asset?.price,
      }),
    },
    name: asset.name || i18n.t('tokens_tab.unknown_token'),
    price: asset.price,
    symbol: asset.symbol,
    type: asset.type === AssetType.nft ? ('nft' as const) : ('erc20' as const),
    decimals: asset.decimals,
    icon_url: asset.icon_url,
    colors: asset.colors,
  };

  return parsedAsset;
}

export function parseUserAsset({
  asset,
  currency,
  balance,
}: {
  asset: Asset;
  currency: SupportedCurrencyKey;
  balance: string;
}) {
  const parsedAsset = parseAsset({ asset, currency });
  return parseUserAssetBalances({ asset: parsedAsset, currency, balance });
}
export type ParsedUserAsset = ReturnType<typeof parseUserAsset>;

export function parseUserAssetBalances({
  asset,
  currency,
  balance,
}: {
  asset: ParsedAsset;
  currency: SupportedCurrencyKey;
  balance: string;
}) {
  const { decimals, symbol, price } = asset;
  const amount = convertRawAmountToDecimalFormat(balance, decimals);

  return {
    ...asset,
    balance: {
      amount,
      display: convertAmountToBalanceDisplay(amount, { decimals, symbol }),
    },
    native: {
      ...asset.native,
      balance: getNativeAssetBalance({
        currency,
        decimals,
        priceUnit: price?.value || 0,
        value: amount,
      }),
    },
  };
}

export const parseSearchAsset = ({
  assetWithPrice,
  searchAsset,
  userAsset,
}: {
  assetWithPrice?: ParsedAsset;
  searchAsset: ParsedSearchAsset | SearchAsset;
  userAsset?: ParsedUserAsset;
}): ParsedSearchAsset => ({
  ...searchAsset,
  address: searchAsset.address,
  chainId: searchAsset.chainId,
  chainName: chainNameFromChainId(searchAsset.chainId),
  native: {
    balance: userAsset?.native.balance || {
      amount: '0',
      display: '0.00',
    },
    price: assetWithPrice?.native.price || userAsset?.native?.price,
  },
  price: assetWithPrice?.price || userAsset?.price,
  balance: userAsset?.balance || { amount: '0', display: '0.00' },
  icon_url:
    userAsset?.icon_url || assetWithPrice?.icon_url || searchAsset?.icon_url,
  colors: userAsset?.colors || assetWithPrice?.colors || searchAsset?.colors,
  type: userAsset?.type || assetWithPrice?.type,
});

export function filterAsset(asset: ZerionAsset) {
  const nameFragments = asset?.name?.split(' ');
  const nameContainsURL = nameFragments.some((f) => isURL(f));
  const symbolFragments = asset?.symbol?.split(' ');
  const symbolContainsURL = symbolFragments.some((f) => isURL(f));
  const shouldFilter = nameContainsURL || symbolContainsURL;
  return shouldFilter;
}

export const fetchAssetBalanceViaProvider = async ({
  parsedAsset,
  currentAddress,
  currency,
  provider,
}: {
  parsedAsset: ParsedUserAsset;
  currentAddress: Address;
  currency: SupportedCurrencyKey;
  provider: Provider;
}) => {
  const balance = parsedAsset.isNativeAsset
    ? await provider.getBalance(currentAddress)
    : await getContract({
        address: parsedAsset.address,
        abi: erc20ABI,
        signerOrProvider: provider,
      }).balanceOf(currentAddress);

  const updatedAsset = parseUserAssetBalances({
    asset: parsedAsset,
    currency,
    balance: balance.toString(),
  });
  return updatedAsset;
};
