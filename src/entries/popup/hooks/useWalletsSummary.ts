import { useMemo } from 'react';
import { Address } from 'viem';

import { SupportedCurrencyKey } from '~/core/references';
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
  const summaryByChain = addressData?.summary_by_chain;

  console.log('summaryByChain', summaryByChain);

  //   const chainIds = [
  //     ChainId.mainnet,
  //     ChainId.bsc,
  //     ChainId.polygon,
  //     ChainId.avalanche,
  //   ];

  const chainIds = Object.keys(summaryByChain || {}).map((id) =>
    Number(id),
  ) as ChainId[];

  const chainBalances = chainIds.map((chainId) => {
    const chainData = summaryByChain?.[chainId];
    const chainRawBalance = chainData?.native_balance;
    const chainBalance = convertRawAmountToBalance(
      chainRawBalance?.quantity || 0,
      {
        decimals: 18,
      },
    ).amount;
    const chainCurrencyBalance = convertAmountAndPriceToNativeDisplay(
      chainBalance || 0,
      nativeAssets?.[chainId]?.price?.value || 0,
      currentCurrency,
    ).amount;

    return chainCurrencyBalance;
  });

  const balance = chainBalances.reduce((prev, curr) => add(prev, curr), '0');

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
