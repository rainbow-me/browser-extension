import { Address } from 'wagmi';

import {
  BNB_MAINNET_ADDRESS,
  ETH_ADDRESS,
  MATIC_MAINNET_ADDRESS,
} from '~/core/references';
import { useAddysSummary } from '~/core/resources/addys/addysSummary';
import { useCurrentCurrencyStore } from '~/core/state';
import {
  add,
  convertAmountAndPriceToNativeDisplay,
  convertAmountToNativeDisplay,
} from '~/core/utils/numbers';

import { useNativeAssets } from './useNativeAssets';

export const useWalletsSummary = ({ addresses }: { addresses: Address[] }) => {
  const nativeAssets = useNativeAssets();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data, isLoading } = useAddysSummary({
    addresses,
    currency: currentCurrency,
  });

  const address = addresses[0];
  const {
    ETH: ethBalance,
    BNB: bnbBalance,
    MATIC: maticBalance,
  } = data?.data.addresses[address].summary.native_balance_by_symbol || {};

  const ethCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    ethBalance?.quantity || 0,
    nativeAssets?.[ETH_ADDRESS].price?.value || 0,
    currentCurrency,
  ).amount;

  const bnbCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    bnbBalance?.quantity || 0,
    nativeAssets?.[BNB_MAINNET_ADDRESS].price?.value || 0,
    currentCurrency,
  ).amount;

  const maticCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    maticBalance?.quantity || 0,
    nativeAssets?.[MATIC_MAINNET_ADDRESS].price?.value || 0,
    currentCurrency,
  ).amount;

  const balance = add(
    add(ethCurrencyBalance, bnbCurrencyBalance),
    maticCurrencyBalance,
  );

  const balanceDisplay = convertAmountToNativeDisplay(balance, currentCurrency);
  const lastTx = data?.data.addresses[address].summary.last_activity;

  return {
    balance: {
      amount: balance,
      display: balanceDisplay,
    },
    lastTx,
    isLoading,
  };
};
