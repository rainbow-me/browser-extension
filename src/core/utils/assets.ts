import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import isURL from 'validator/lib/isURL';
import { Address, erc20ABI } from 'wagmi';

import { SupportedCurrencyKey } from '~/core/references';
import {
  AddressOrEth,
  AssetMetadata,
  ParsedAsset,
  ParsedSearchAsset,
  ParsedUserAsset,
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
  address: AddressOrEth;
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
    type: asset?.type ?? 'token',
    uniqueId,
    decimals: asset?.decimals,
    icon_url: asset?.icon_url,
  };

  return parsedAsset;
}

export function parseAssetMetadata({
  address,
  asset,
  chainId,
  currency,
}: {
  address: AddressOrEth;
  asset: AssetMetadata;
  chainId: ChainId;
  currency: SupportedCurrencyKey;
}): ParsedAsset {
  const mainnetAddress = asset.networks?.[ChainId.mainnet]?.address || address;
  const uniqueId = `${mainnetAddress || address}_${chainId}`;
  const priceData = {
    relative_change_24h: asset?.price?.relativeChange24h,
    value: asset?.price?.value,
  };
  const parsedAsset = {
    address,
    chainId,
    chainName: chainNameFromChainId(chainId),
    colors: asset?.colors,
    decimals: asset?.decimals,
    icon_url: asset?.iconUrl,
    isNativeAsset: isNativeAsset(address, chainId),
    mainnetAddress,
    name: asset?.name || i18n.t('tokens_tab.unknown_token'),
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData,
      }),
    },
    price: priceData,
    symbol: asset?.symbol,
    type: 'token',
    uniqueId,
  };
  return parsedAsset;
}

export function parseUserAsset({
  address,
  asset,
  currency,
  quantity,
  smallBalance,
}: {
  address: AddressOrEth;
  asset: ZerionAsset;
  currency: SupportedCurrencyKey;
  quantity: string;
  smallBalance?: boolean;
}): ParsedUserAsset {
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
    smallBalance,
  };
}

export function parseParsedUserAsset({
  parsedAsset,
  currency,
  quantity,
}: {
  parsedAsset: ParsedUserAsset;
  currency: SupportedCurrencyKey;
  quantity: string;
}): ParsedUserAsset {
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
  if (parsedAsset.isNativeAsset) {
    const balance = await provider.getBalance(currentAddress);
    const updatedAsset = parseParsedUserAsset({
      parsedAsset,
      currency,
      quantity: balance.toString(),
    });
    return updatedAsset;
  } else {
    const contract = new Contract(parsedAsset.address, erc20ABI, provider);
    const balance = await contract.balanceOf(currentAddress);
    const updatedAsset = parseParsedUserAsset({
      parsedAsset,
      currency,
      quantity: balance.toString(),
    });
    return updatedAsset;
  }
};

const assetQueryFragment = (
  address: AddressOrEth,
  chainId: ChainId,
  currency: SupportedCurrencyKey,
  index: number,
) => {
  return `Q${index}: token(address: "${address}", chainID: ${chainId}, currency: "${currency}") {
      colors {
        primary
        fallback
        shadow
      }
      circulatingSupply
      decimals
      description
      fullyDilutedValuation
      iconUrl
      marketCap
      name
      networks
      price {
        value
        relativeChange24h
      }
      symbol
      totalSupply
      volume1d
  }`;
};

export const chunkArray = (arr: AddressOrEth[], chunkSize: number) => {
  const result = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
};

export const createAssetQuery = (
  addresses: AddressOrEth[],
  chainId: ChainId,
  currency: SupportedCurrencyKey,
) => {
  return `{
        ${addresses
          .map((a, i) => assetQueryFragment(a, chainId, currency, i))
          .join(',')}
    }`;
};
