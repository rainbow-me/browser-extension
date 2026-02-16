import { Address, erc20Abi, formatUnits, getContract, zeroAddress } from 'viem';

import { metadataClient } from '~/core/graphql';
import { TokenMetadataQuery } from '~/core/graphql/__generated__/metadata';
import { ETH_ADDRESS, SupportedCurrencyKey } from '~/core/references';
import {
  AddressOrEth,
  AssetApiResponse,
  ParsedAsset,
  ParsedSearchAsset,
  ParsedUserAsset,
  UniqueId,
  ZerionAssetPrice,
} from '~/core/types/assets';
import { ChainId, ChainName, chainIdToNameMapping } from '~/core/types/chains';

import { i18n } from '../languages';
import { customChainIdsToAssetNames } from '../references/assets';
import { AddysPositionAsset } from '../resources/positions';
import { SearchAsset } from '../types/search';
import { getViemClient } from '../viem/clients';

import { isNativeAsset } from './chains';
import { SCALE, decToFixed } from './dinero';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountToBalanceDisplay,
  convertAmountToNativeDisplay,
  convertAmountToPercentageDisplay,
  safeBigInt,
} from './numbers';
import { isLowerCaseMatch } from './strings';

export type TokenMetadata = NonNullable<TokenMetadataQuery['token']>;

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
    transferable: asset.transferable,
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
  asset: TokenMetadata;
  chainId: ChainId;
  currency: SupportedCurrencyKey;
}): ParsedAsset {
  const mainnetAddress =
    (asset.networks[ChainId.mainnet]?.address as AddressOrEth) || address;
  const uniqueId = `${address}_${chainId}`;
  const priceData: ZerionAssetPrice = {
    relative_change_24h: asset.price.relativeChange24h ?? undefined,
    value: asset.price.value ?? 0,
  };
  const parsedAsset = {
    address,
    chainId,
    chainName: chainIdToNameMapping[chainId],
    colors: {
      primary: asset.colors.primary,
      fallback: asset.colors.fallback ?? undefined,
      shadow: asset.colors.shadow ?? undefined,
    },
    decimals: asset.decimals,
    icon_url: asset.iconUrl ?? undefined,
    isNativeAsset: isNativeAsset(address, chainId),
    mainnetAddress,
    name: asset.name || i18n.t('tokens_tab.unknown_token'),
    native: {
      price: getNativeAssetPrice({
        currency,
        priceData,
      }),
    },
    price: priceData,
    symbol: asset.symbol,
    uniqueId,
    networks: asset.networks as ParsedAsset['networks'],
  } satisfies ParsedAsset;
  return parsedAsset;
}

export function parseUserAsset({
  asset,
  currency,
  balance,
  cappedValue,
  smallBalance,
}: {
  asset: AssetApiResponse | AddysPositionAsset;
  currency: SupportedCurrencyKey;
  balance: string;
  cappedValue?: string;
  smallBalance?: boolean;
}) {
  const parsedAsset = parseAsset({ asset, currency });
  return parseUserAssetBalances({
    asset: parsedAsset,
    currency,
    balance,
    cappedValue,
    smallBalance,
  });
}

export function parseUserAssetBalances({
  asset,
  currency,
  balance,
  cappedValue: platformValue,
  smallBalance = false,
}: {
  asset: ParsedAsset;
  currency: SupportedCurrencyKey;
  balance: string;
  cappedValue?: string;
  smallBalance?: boolean;
}) {
  const { decimals, symbol, price } = asset;
  const amount = formatUnits(safeBigInt(balance), decimals);
  const calculatedNativeBalance = getNativeAssetBalance({
    currency,
    decimals,
    priceUnit: price?.value || 0,
    value: amount,
  });
  const cappedNativeBalance =
    platformValue !== undefined
      ? {
          amount: platformValue,
          display: convertAmountToNativeDisplay(platformValue, currency),
        }
      : undefined;

  // TODO: remove the next 2 lines after BE fixes their smallBalance issue
  let isZeroCappedAmount = false;
  try {
    isZeroCappedAmount =
      platformValue !== undefined && decToFixed(platformValue) === 0n;
  } catch {
    /* non-numeric platformValue */
  }
  const resolvedSmallBalance = smallBalance || isZeroCappedAmount;

  return {
    ...asset,
    balance: {
      amount,
      display: convertAmountToBalanceDisplay(amount, { decimals, symbol }),
      ...(cappedNativeBalance ? { capped: cappedNativeBalance } : {}),
    },
    native: {
      ...asset.native,
      balance: calculatedNativeBalance,
    },
    // Temporary frontend patch until backend toggles zero balances as small.
    smallBalance: resolvedSmallBalance,
  };
}

export type PlatformValueComparisonDirection = 'higher' | 'lower' | 'equal';

export type PlatformValueComparison = {
  shouldApproximate: boolean;
  direction: PlatformValueComparisonDirection;
};

export const compareCappedAmountToCalculatedValue = ({
  cappedAmount,
  calculatedAmount,
  threshold = 0.1,
}: {
  cappedAmount?: string;
  calculatedAmount: string;
  threshold?: number;
}): PlatformValueComparison => {
  if (cappedAmount === undefined) {
    return { shouldApproximate: false, direction: 'equal' };
  }

  const platformFixed = decToFixed(cappedAmount || '0');
  const calculatedFixed = decToFixed(calculatedAmount || '0');

  if (calculatedFixed === 0n) {
    if (platformFixed === 0n) {
      return { shouldApproximate: false, direction: 'equal' };
    }
    return {
      shouldApproximate: true,
      direction: platformFixed > 0n ? 'higher' : 'equal',
    };
  }

  const diffFixed = platformFixed - calculatedFixed;
  const absDiff = diffFixed < 0n ? -diffFixed : diffFixed;
  const absCalc = calculatedFixed < 0n ? -calculatedFixed : calculatedFixed;
  const ratioFixed = (absDiff * SCALE) / absCalc;
  const thresholdFixed = decToFixed(String(threshold));

  if (ratioFixed > thresholdFixed) {
    const direction: PlatformValueComparisonDirection =
      platformFixed > calculatedFixed ? 'higher' : 'lower';
    return { shouldApproximate: true, direction };
  }

  return { shouldApproximate: false, direction: 'equal' };
};

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
  chainIdOverride,
}: {
  parsedAsset: ParsedUserAsset;
  currentAddress: Address;
  currency: SupportedCurrencyKey;
  chainIdOverride?: number;
}) => {
  const client = getViemClient({
    chainId: chainIdOverride ?? parsedAsset.chainId,
  });
  const balance = parsedAsset.isNativeAsset
    ? await client.getBalance({ address: currentAddress })
    : await client.readContract({
        address: parsedAsset.address as Address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [currentAddress],
      });

  const updatedAsset = parseUserAssetBalances({
    asset: parsedAsset,
    currency,
    balance: balance.toString(),
    cappedValue: parsedAsset.balance.capped?.amount,
  });
  return updatedAsset;
};

export const chunkArray = <TItem>(arr: TItem[], chunkSize: number) => {
  const result = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }

  return result;
};

export const getAssetMetadata = async ({
  address,
  chainId,
}: {
  address: Address;
  chainId: ChainId;
}) => {
  const client = getViemClient({ chainId });
  const [decimals, symbol, name] = await Promise.allSettled([
    client.readContract({
      address,
      abi: erc20Abi,
      functionName: 'decimals',
    }),
    client.readContract({
      address,
      abi: erc20Abi,
      functionName: 'symbol',
    }),
    client.readContract({
      address,
      abi: erc20Abi,
      functionName: 'name',
    }),
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
  const client = getViemClient({ chainId });
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
  const response = await metadataClient.tokenMetadata(
    {
      address: parsedAsset.address,
      chainId: parsedAsset.chainId,
      currency,
    },
    { timeout: 10000 },
  );

  const asset = response.token;
  if (!asset) return null;
  const parsedAssetWithPrice = parseAssetMetadata({
    address: parsedAsset.address,
    asset,
    chainId: parsedAsset.chainId,
    currency,
  });
  if (parsedAssetWithPrice?.native.price) {
    const assetToReturn: ParsedAsset = {
      ...parsedAsset,
      native: {
        ...parsedAsset.native,
        price: parsedAssetWithPrice.native.price,
      },
      price: {
        value: parsedAssetWithPrice.native.price.amount,
      },
      icon_url: parsedAssetWithPrice.icon_url,
    };

    return parseUserAssetBalances({
      asset: assetToReturn,
      currency,
      balance: parsedAsset.balance.amount.toString(),
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

export const getCappedAmount = (asset: ParsedUserAsset) =>
  parseFloat(
    asset.balance.capped?.amount ?? asset.native.balance.amount ?? '0',
  );
