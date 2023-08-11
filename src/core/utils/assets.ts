import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { ETH_ADDRESS } from '@rainbow-me/swaps';
import isURL from 'validator/lib/isURL';
import { Address, erc20ABI } from 'wagmi';

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

import { i18n } from '../languages';
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
  chainId: opChainId,
}: {
  address: Address | typeof ETH_ADDRESS;
  asset: ZerionAsset;
  currency: SupportedCurrencyKey;
  chainId?: ChainId;
}): ParsedAsset {
  const chainName = asset?.network ?? ChainName.mainnet;
  const chainId = opChainId || chainIdFromChainName(chainName);
  const mainnetAddress = asset?.mainnet_address;
  const uniqueId: UniqueId = `${mainnetAddress || address}_${chainId}`;
  const parsedAsset = {
    address,
    colors: asset?.colors,
    chainId,
    chainName,
    isNativeAsset: isNativeAsset(address, chainIdFromChainName(chainName)),
    name: asset?.name || i18n.t('tokens_tab.unknown_token'),
    mainnetAddress,
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData: asset?.price,
      }),
    },
    price: asset?.price,
    symbol: asset?.symbol,
    type: asset?.type === AssetType.nft ? ('nft' as const) : ('erc20' as const),
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
  assetWithPrice,
  searchAsset,
  userAsset,
}: {
  assetWithPrice?: ParsedAsset;
  searchAsset: ParsedSearchAsset | SearchAsset;
  userAsset?: ParsedAddressAsset;
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
  parsedAsset: ParsedAddressAsset;
  currentAddress: Address;
  currency: SupportedCurrencyKey;
  provider: Provider;
}) => {
  if (parsedAsset.isNativeAsset) {
    const balance = await provider.getBalance(currentAddress);
    const updatedAsset = parseParsedAddressAsset({
      parsedAsset,
      currency,
      quantity: balance.toString(),
    });
    return updatedAsset;
  } else {
    const contract = new Contract(parsedAsset.address, erc20ABI, provider);
    const balance = await contract.balanceOf(currentAddress);
    const updatedAsset = parseParsedAddressAsset({
      parsedAsset,
      currency,
      quantity: balance.toString(),
    });
    return updatedAsset;
  }
};
