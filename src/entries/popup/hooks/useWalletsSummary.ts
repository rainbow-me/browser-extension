import { useMemo } from 'react';
import { Address } from 'viem';

import { SupportedCurrencyKey } from '~/core/references';
import {
  AddySummary,
  useAddysSummary,
} from '~/core/resources/addys/addysSummary';
import { useCurrentCurrencyStore } from '~/core/state';
import { convertAmountToNativeDisplay } from '~/core/utils/numbers';

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
}: {
  address: Address;
  addysSummary?: AddySummary;
  currentCurrency: SupportedCurrencyKey;
}): WalletSummary => {
  const addressData =
    addysSummary?.data?.addresses?.[address.toLowerCase() as Address];

  // Use asset_value from backend which includes native balances + ERC20 tokens
  // Already converted to the requested currency
  const assetValue = addressData?.summary.asset_value ?? 0;
  const balance = assetValue.toString();
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
        });
        return prev;
      }, {}) || {},
    [addresses, currentCurrency, data],
  );

  return { walletsSummary, isLoading };
};
