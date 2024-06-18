import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { getClient } from '@wagmi/core';
import { Address, Client, erc20Abi, getContract } from 'viem';

import { ETH_ADDRESS, SupportedCurrencyKey } from '~/core/references';
import {
  AddressOrEth,
  AssetApiResponse,
  AssetMetadata,
  ParsedAsset,
  ParsedSearchAsset,
  ParsedUserAsset,
  UniqueId,
  ZerionAssetPrice,
} from '~/core/types/assets';
import { ChainId, ChainName, chainIdToNameMapping } from '~/core/types/chains';

import { requestMetadata } from '../graphql';
import { i18n } from '../languages';
import { customChainIdsToAssetNames } from '../references/assets';
import { AddysPositionAsset } from '../resources/positions';
import { SearchAsset } from '../types/search';
import { wagmiConfig } from '../wagmi';
import { getProvider } from '../wagmi/clientToProvider';

import { isNativeAsset } from './chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
  convertAmountToNativeDisplay,
  convertAmountToPercentageDisplay,
  convertAmountToRawAmount,
  convertRawAmountToDecimalFormat,
} from './numbers';
import { isLowerCaseMatch } from './strings';

const get24HrChange = (priceData?: ZerionAssetPrice) => {
  const twentyFourHrChange = priceData?.relative_change_24h;
  return twentyFourHrChange
    ? convertAmountToPercentageDisplay(twentyFourHrChange)
    : '';
};

export const getCustomChainIconUrl = (
  chainId: ChainId,
  address: AddressOrEth,
) => {
  if (!chainId || !customChainIdsToAssetNames[chainId]) return '';
  const baseUrl =
    'https://raw.githubusercontent.com/rainbow-me/assets/master/blockchains/';

  if (address === AddressZero || address === ETH_ADDRESS) {
    return `${baseUrl}${customChainIdsToAssetNames[chainId]}/info/logo.png`;
  } else {
    return `${baseUrl}${customChainIdsToAssetNames[chainId]}/assets/${address}/logo.png`;
  }
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
  asset: AssetApiResponse;
  currency: SupportedCurrencyKey;
}): ParsedAsset {
  const address = asset.asset_code;
  const chainName = asset.network ?? ChainName.mainnet;
  const networks = 'networks' in asset ? asset.networks || {} : {};
  const chainId = asset.chain_id;
  const mainnetAddress =
    asset.symbol === 'ETH' ? ETH_ADDRESS : networks[ChainId.mainnet]?.address;

  const standard = 'interface' in asset ? asset.interface : undefined;

  const uniqueId: UniqueId = `${asset.asset_code}_${chainId}`;
  const parsedAsset = {
    assetCode: asset.asset_code,
    address,
    uniqueId,
    chainId,
    chainName,
    mainnetAddress,
    isNativeAsset: isNativeAsset(address, chainId),
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData: asset?.price,
      }),
    },
    name: asset.name || i18n.t('tokens_tab.unknown_token'),
    price: asset.price,
    symbol: asset.symbol,
    type: asset.type,
    decimals: asset.decimals,
    icon_url: asset.icon_url || getCustomChainIconUrl(chainId, address),
    colors: asset.colors,
    standard,
    networks: asset.networks,
    ...('bridging' in asset && {
      bridging: {
        isBridgeable: !!asset.bridging.bridgeable,
        networks: asset.bridging.networks,
      },
    }),
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
  const uniqueId = `${address}_${chainId}`;
  const priceData = {
    relative_change_24h: asset?.price?.relativeChange24h,
    value: asset?.price?.value,
  };
  const parsedAsset = {
    address,
    chainId,
    chainName: chainIdToNameMapping[chainId],
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
    uniqueId,
    networks: asset?.networks,
  } satisfies ParsedAsset;
  return parsedAsset;
}

export function parseUserAsset({
  asset,
  currency,
  balance,
  smallBalance,
}: {
  asset: AssetApiResponse | AddysPositionAsset;
  currency: SupportedCurrencyKey;
  balance: string;
  smallBalance?: boolean;
}) {
  const parsedAsset = parseAsset({ asset, currency });
  return parseUserAssetBalances({
    asset: parsedAsset,
    currency,
    balance,
    smallBalance,
  });
}

export function parseUserAssetBalances({
  asset,
  currency,
  balance,
  smallBalance = false,
}: {
  asset: ParsedAsset;
  currency: SupportedCurrencyKey;
  balance: string;
  smallBalance?: boolean;
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
  chainName: chainIdToNameMapping[searchAsset.chainId],
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
    : await new Contract(parsedAsset.address, erc20Abi, provider).balanceOf(
        currentAddress,
      );

  const updatedAsset = parseUserAssetBalances({
    asset: parsedAsset,
    currency,
    balance: balance.toString(),
  });
  return updatedAsset;
};

const assetQueryFragment = (
  address: AddressOrEth,
  chainId: ChainId,
  currency: SupportedCurrencyKey,
  index: number,
  withPrice?: boolean,
) => {
  const priceQuery = withPrice ? 'price { value relativeChange24h }' : '';
  return `Q${index}: token(address: "${address}", chainID: ${chainId}, currency: "${currency}") {
      colors {
        primary
        fallback
        shadow
      }
      decimals
      iconUrl
      name
      networks
      symbol
      ${priceQuery}
  }`;
};

export const chunkArray = <TItem>(arr: TItem[], chunkSize: number) => {
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
  withPrice?: boolean,
) => {
  return `{
        ${addresses
          .map((a, i) => assetQueryFragment(a, chainId, currency, i, withPrice))
          .join(',')}
    }`;
};

export const getAssetMetadata = async ({
  address,
  chainId,
}: {
  address: Address;
  chainId: ChainId;
}) => {
  const provider = getProvider({ chainId });
  const contract = new Contract(address, erc20Abi, provider);
  const [decimals, symbol, name] = await Promise.allSettled([
    contract.decimals(),
    contract.symbol(),
    contract.name(),
  ]);
  return {
    decimals: extractFulfilledValue<number>(decimals),
    symbol: extractFulfilledValue<string>(symbol),
    name: extractFulfilledValue<string>(name),
  };
};

export const getAssetBalance = async ({
  assetAddress,
  currentAddress,
  chainId,
}: {
  assetAddress: Address;
  currentAddress: Address;
  chainId: ChainId;
}) => {
  const client = getClient(wagmiConfig, { chainId }) as Client;
  const balance = await getContract({
    address: assetAddress,
    abi: erc20Abi,
    client,
  }).read.balanceOf([currentAddress]);

  return balance.toString();
};

export const extractFulfilledValue = <T>(
  result: PromiseSettledResult<T>,
): T | undefined => (result.status === 'fulfilled' ? result.value : undefined);

export const fetchAssetWithPrice = async ({
  parsedAsset,
  currency,
}: {
  parsedAsset: ParsedUserAsset;
  currency: SupportedCurrencyKey;
}): Promise<ParsedUserAsset | null> => {
  const results: Record<string, AssetMetadata>[] = (await requestMetadata(
    createAssetQuery(
      [parsedAsset.address],
      parsedAsset.chainId,
      currency,
      true,
    ),
    {
      timeout: 10000,
    },
  )) as Record<string, AssetMetadata>[];

  const assets = Object.values(results).flat();
  const asset = assets[0];
  const parsedAssetWithPrice = parseAssetMetadata({
    address: parsedAsset.address,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    asset,
    chainId: parsedAsset.chainId,
    currency,
  });
  if (parsedAssetWithPrice?.native.price) {
    const assetToReturn = {
      ...parsedAsset,
      native: {
        ...parsedAsset.native,
        price: parsedAssetWithPrice.native.price,
      },
      price: {
        value: parsedAssetWithPrice.native.price.amount,
      },
      icon_url: parsedAssetWithPrice.icon_url,
    } as ParsedAsset;

    return parseUserAssetBalances({
      asset: assetToReturn,
      currency,
      balance: convertAmountToRawAmount(
        parsedAsset.balance.amount,
        parsedAsset.decimals,
      ),
      smallBalance: false,
    });
  }
  return null;
};

export const isSameAsset = (
  a1: Pick<ParsedAsset, 'chainId' | 'address'>,
  a2: Pick<ParsedAsset, 'chainId' | 'address'>,
) => +a1.chainId === +a2.chainId && isLowerCaseMatch(a1.address, a2.address);

export const isSameAssetInDiffChains = (
  a1?: Pick<ParsedAsset, 'address' | 'networks'> | null,
  a2?: Pick<ParsedAsset, 'address'> | null,
) => {
  if (!a1?.networks || !a2) return false;
  return Object.values(a1.networks).some(
    (assetInNetwork) => assetInNetwork?.address === a2.address,
  );
};
