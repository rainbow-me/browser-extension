import { useMemo } from 'react';
import { Address } from 'viem';

import {
  AVAX_AVALANCHE_ADDRESS,
  BNB_MAINNET_ADDRESS,
  MATIC_MAINNET_ADDRESS,
  SupportedCurrencyKey,
} from '~/core/references';
import {
  AddySummary,
  useAddysSummary,
} from '~/core/resources/addys/addysSummary';
import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import {
  add,
  convertAmountAndPriceToNativeDisplay,
  convertAmountToNativeDisplay,
  convertRawAmountToBalance,
} from '~/core/utils/numbers';

import { useNativeAssets } from './useNativeAssets';

export interface WalletSummary {
  balance: {
    amount: string;
    display: string;
  };
  lastTx?: number;
  address: Address;
}

const parseAddressSummary = ({
  address,
  addysSummary,
  currentCurrency,
  nativeAssets,
}: {
  address: Address;
  addysSummary?: AddySummary;
  currentCurrency: SupportedCurrencyKey;
  nativeAssets:
    | {
        [key: string]: ParsedAsset;
      }
    | undefined;
}): WalletSummary => {
  const addressData =
    addysSummary?.data.addresses[address.toLowerCase() as Address];
  const {
    ETH: ethRawBalance,
    BNB: bnbRawBalance,
    MATIC: maticRawBalance,
    AVAX: avaxRawBalance,
  } = addressData?.summary.native_balance_by_symbol || {};

  const ethBalance = convertRawAmountToBalance(ethRawBalance?.quantity || 0, {
    decimals: 18,
  }).amount;
  const ethCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    ethBalance || 0,
    nativeAssets?.[ChainId.mainnet]?.price?.value || 0,
    currentCurrency,
  ).amount;

  const bnbBalance = convertRawAmountToBalance(bnbRawBalance?.quantity || 0, {
    decimals: 18,
  }).amount;
  const bnbCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    bnbBalance || 0,
    nativeAssets?.[`${BNB_MAINNET_ADDRESS}_1`]?.price?.value || 0,
    currentCurrency,
  ).amount;

  const maticBalance = convertRawAmountToBalance(
    maticRawBalance?.quantity || 0,
    {
      decimals: 18,
    },
  ).amount;
  const maticCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    maticBalance || 0,
    nativeAssets?.[`${MATIC_MAINNET_ADDRESS}_1`]?.price?.value || 0,
    currentCurrency,
  ).amount;

  const avaxBalance = convertRawAmountToBalance(avaxRawBalance?.quantity || 0, {
    decimals: 18,
  }).amount;
  const avaxCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    avaxBalance || 0,
    nativeAssets?.[`${AVAX_AVALANCHE_ADDRESS}_1`]?.price?.value || 0,
    currentCurrency,
  ).amount;

  const balance = add(
    add(ethCurrencyBalance, bnbCurrencyBalance),
    add(maticCurrencyBalance, avaxCurrencyBalance),
  );

  const balanceDisplay = convertAmountToNativeDisplay(balance, currentCurrency);
  const lastTx = addressData?.summary.last_activity;

  return {
    balance: {
      amount: balance,
      display: balanceDisplay,
    },
    lastTx,
    address,
  };
};

export const useWalletsSummary = ({ addresses }: { addresses: Address[] }) => {
  const nativeAssets = useNativeAssets();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data, isLoading } = useAddysSummary({
    addresses,
    currency: currentCurrency,
  });

  const walletsSummary: { [key: Address]: WalletSummary } = useMemo(
    () =>
      addresses?.reduce((prev: { [key: Address]: WalletSummary }, address) => {
        prev[address] = parseAddressSummary({
          address,
          addysSummary: data,
          currentCurrency,
          nativeAssets,
        });
        return prev;
      }, {}) || [],
    [addresses, currentCurrency, data, nativeAssets],
  );

  return { walletsSummary, isLoading };
};
