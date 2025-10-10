import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { getClient } from '@wagmi/core';
import { Address, Client, erc20Abi, getContract, zeroAddress } from 'viem';

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
import type {
  BridgeableNetworkMapping,
  Asset as PlatformTransactionAsset,
} from '~/core/types/gen/plattform/transaction/transaction';

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
import { toNullableNumber, toNumber } from './platform';
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

  if (address === zeroAddress || address === ETH_ADDRESS) {
    return `${baseUrl}${customChainIdsToAssetNames[chainId]}/info/logo.png`;
  } else {
    return `${baseUrl}${customChainIdsToAssetNames[chainId]}/assets/${address}/logo.png`;
  }
};

const getNativeAssetPrice = ({
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

const normalizeAssetPrice = (
  price:
    | AssetApiResponse['price']
    | PlatformTransactionAsset['price']
    | undefined,
): ZerionAssetPrice | undefined => {
  if (!price) return undefined;

  const value = toNumber((price as { value?: string | number }).value);
  const relativeChange = toNullableNumber(
    (price as { relativeChange24h?: string | number }).relativeChange24h ??
      null,
  );

  const normalized: ZerionAssetPrice = {
    value,
  };

  if (relativeChange !== null) {
    normalized.relative_change_24h = relativeChange;
  }

  return normalized;
};

const normalizeAssetNetworks = (
  networks:
    | AssetApiResponse['networks']
    | PlatformTransactionAsset['networks']
    | undefined,
): Record<number, { address: AddressOrEth; decimals: number }> => {
  if (!networks) return {};

  if (Array.isArray(networks)) {
    return networks.reduce<
      Record<number, { address: AddressOrEth; decimals: number }>
    >((acc, mapping) => {
      if (!mapping || !mapping.tokenMapping) {
        return acc;
      }

      const chainId = Number(mapping.chainId);
      if (Number.isNaN(chainId)) {
        return acc;
      }

      acc[chainId] = {
        address: mapping.tokenMapping.address as AddressOrEth,
        decimals: mapping.tokenMapping.decimals,
      };

      return acc;
    }, {});
  }

  return Object.entries(networks ?? {}).reduce<
    Record<number, { address: AddressOrEth; decimals: number }>
  >((acc, [chainId, info]) => {
    if (!info) return acc;
    const parsedChainId = Number(chainId);
    if (Number.isNaN(parsedChainId)) return acc;
    acc[parsedChainId] = {
      address: info.address as AddressOrEth,
      decimals: info.decimals,
    };
    return acc;
  }, {});
};

const hasProp = <K extends PropertyKey>(
  value: unknown,
  prop: K,
): value is Record<K, unknown> =>
  typeof value === 'object' && value !== null && prop in value;

const isHexAddress = (value: unknown): value is Address =>
  typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value);

const extractIconUrl = (
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset,
) => {
  if (hasProp(asset, 'iconUrl')) {
    const value = asset.iconUrl;
    return typeof value === 'string' &&
      value !== 'undefined' &&
      value.length > 0
      ? value
      : undefined;
  }
  if (hasProp(asset, 'icon_url')) {
    const value = (asset as unknown as Record<string, unknown>)['icon_url'];
    return typeof value === 'string' &&
      value !== 'undefined' &&
      value.length > 0
      ? value
      : undefined;
  }
  return undefined;
};

const extractAssetSymbol = (
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset,
) => {
  if (hasProp(asset, 'symbol')) {
    const value = (asset as unknown as Record<string, unknown>)['symbol'];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
  return undefined;
};

const extractAssetType = (
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset,
) => {
  if (hasProp(asset, 'type')) {
    const value = (asset as unknown as Record<string, unknown>)['type'];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
  return undefined;
};

const extractNumericChainId = (
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset,
): number | undefined => {
  if (hasProp(asset, 'chainId')) {
    const value = (asset as unknown as Record<string, unknown>)['chainId'];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
  }
  return undefined;
};

const extractAssetCode = (
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset,
): string | undefined => {
  if (hasProp(asset, 'asset_code')) {
    const value = (asset as unknown as Record<string, unknown>)['asset_code'];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
  if (hasProp(asset, 'assetCode')) {
    const value = (asset as unknown as Record<string, unknown>)['assetCode'];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
  return undefined;
};

const extractAssetAddress = (
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset,
): AddressOrEth | undefined => {
  if (hasProp(asset, 'address')) {
    const value = (asset as unknown as Record<string, unknown>)['address'];
    if (typeof value === 'string' && value.length > 0) {
      if (value.toLowerCase() === ETH_ADDRESS) return ETH_ADDRESS;
      if (isHexAddress(value)) return value as Address;
    }
  }
  return undefined;
};

const normalizeAssetBridging = (
  bridging:
    | AssetApiResponse['bridging']
    | PlatformTransactionAsset['bridging']
    | undefined,
) => {
  if (!bridging) return undefined;

  const networks: Record<number, { bridgeable: boolean }> = {};

  const potentialArray = (bridging as PlatformTransactionAsset['bridging'])
    ?.networks;
  if (Array.isArray(potentialArray)) {
    for (const mapping of potentialArray as BridgeableNetworkMapping[]) {
      if (!mapping) continue;
      const chainId = Number(mapping.chainId);
      if (Number.isNaN(chainId) || !mapping.bridgeableNetwork) continue;
      networks[chainId] = {
        bridgeable: Boolean(mapping.bridgeableNetwork.bridgeable),
      };
    }
  } else {
    const record = (bridging as AssetApiResponse['bridging'])?.networks ?? {};
    for (const [chainId, info] of Object.entries(record)) {
      if (!info) continue;
      const parsedChainId = Number(chainId);
      if (Number.isNaN(parsedChainId)) continue;
      networks[parsedChainId] = { bridgeable: Boolean(info.bridgeable) };
    }
  }

  const baseBridgeable = Boolean(
    (bridging as { bridgeable?: boolean }).bridgeable,
  );

  return {
    isBridgeable:
      baseBridgeable ||
      Object.values(networks).some((network) => network.bridgeable),
    networks,
  };
};

const getNativeAssetBalance = ({
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
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset;
  currency: SupportedCurrencyKey;
}): ParsedAsset {
  const rawNetworks =
    'networks' in asset ? (asset.networks as unknown) : undefined;
  const networksMap = normalizeAssetNetworks(
    rawNetworks as
      | AssetApiResponse['networks']
      | PlatformTransactionAsset['networks']
      | undefined,
  );

  const iconUrl = extractIconUrl(asset);
  const iconAddress = iconUrl
    ? iconUrl.match(/0x[a-fA-F0-9]{40}/)?.[0]?.toLowerCase()
    : undefined;

  const chainIdNumeric = extractNumericChainId(asset);
  const resolvedChainId =
    chainIdNumeric && !Number.isNaN(chainIdNumeric) ? chainIdNumeric : 0;
  const chainId = resolvedChainId as ChainId;

  const networkAddress =
    networksMap[chainId]?.address ?? networksMap[ChainId.mainnet]?.address;

  const explicitAssetCode = extractAssetCode(asset);
  const explicitAddress = extractAssetAddress(asset);
  const fallbackAssetCode: AddressOrEth =
    extractAssetSymbol(asset) === 'ETH' ? ETH_ADDRESS : zeroAddress;

  const assetCode: AddressOrEth =
    (explicitAssetCode as AddressOrEth | undefined) ??
    explicitAddress ??
    networkAddress ??
    (iconAddress as Address | undefined) ??
    fallbackAssetCode;

  const assetType = extractAssetType(asset);
  const symbol = extractAssetSymbol(asset);
  const isExplicitNative =
    assetType === 'native' || symbol === 'ETH' || assetCode === ETH_ADDRESS;

  const address: AddressOrEth = isExplicitNative
    ? ETH_ADDRESS
    : explicitAddress ??
      networkAddress ??
      (iconAddress as Address | undefined) ??
      assetCode;

  const price = normalizeAssetPrice(asset.price);
  const chainName = (asset.network as ChainName) ?? ChainName.mainnet;
  const mainnetAddress =
    symbol === 'ETH'
      ? ETH_ADDRESS
      : (asset as { mainnetAddress?: AddressOrEth }).mainnetAddress ??
        networksMap[ChainId.mainnet]?.address ??
        (iconAddress as Address | undefined);
  const uniqueId: UniqueId = `${assetCode}_${chainId}`;
  const interfaceValue = (asset as { interface?: string }).interface;
  const standard: ParsedAsset['standard'] = (() => {
    if (!interfaceValue) return undefined;
    const normalized = interfaceValue.toLowerCase();
    if (normalized === 'erc721') return 'erc-721';
    if (normalized === 'erc-721') return 'erc-721';
    if (normalized === 'erc1155') return 'erc-1155';
    if (normalized === 'erc-1155') return 'erc-1155';
    return undefined;
  })();
  const colors = asset.colors
    ? {
        primary: asset.colors.primary,
        fallback: asset.colors.fallback,
        shadow: (asset.colors as { shadow?: string }).shadow,
      }
    : undefined;
  const bridging = normalizeAssetBridging(asset.bridging);
  const transferable =
    'hasTransferable' in asset
      ? asset.hasTransferable
        ? asset.transferable
        : undefined
      : asset.transferable;

  const parsedNetworks = networksMap;
  const networks =
    Object.keys(parsedNetworks).length > 0 ? parsedNetworks : undefined;

  const parsedAsset: ParsedAsset = {
    assetCode,
    address,
    uniqueId,
    chainId,
    chainName,
    mainnetAddress,
    isNativeAsset: isNativeAsset(address, chainId),
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData: price,
      }),
    },
    name: asset.name || i18n.t('tokens_tab.unknown_token'),
    price,
    symbol: asset.symbol,
    type: (asset as { type?: string }).type,
    decimals: asset.decimals,
    icon_url: iconUrl || getCustomChainIconUrl(chainId, address),
    colors,
    standard,
    networks,
    ...(bridging && { bridging }),
    transferable,
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
  asset: AssetApiResponse | PlatformTransactionAsset | AddysPositionAsset;
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

export function isParsedUserAsset(
  asset: ParsedAsset | ParsedUserAsset,
): asset is ParsedUserAsset {
  return 'balance' in asset;
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
