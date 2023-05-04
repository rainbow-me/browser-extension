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
  convertRawAmountToBalance,
} from '~/core/utils/numbers';

import { useNativeAssets } from './useNativeAssets';

export const useWalletsSummary = ({ addresses }: { addresses: Address[] }) => {
  const nativeAssets = useNativeAssets();
  const { currentCurrency } = useCurrentCurrencyStore();
  const { data, isLoading } = useAddysSummary({
    addresses,
    currency: currentCurrency,
  });

  const address = addresses[0].toLowerCase() as Address;
  const dataAddresses = data?.data.addresses;
  const addressData = dataAddresses?.[address];
  const {
    ETH: ethRawBalance,
    BNB: bnbRawBalance,
    MATIC: maticRawBalance,
  } = addressData?.summary.native_balance_by_symbol || {};

  const ethBalance = convertRawAmountToBalance(ethRawBalance?.quantity || 0, {
    decimals: 18,
  }).amount;
  const ethCurrencyBalance = convertAmountAndPriceToNativeDisplay(
    ethBalance || 0,
    nativeAssets?.[`${ETH_ADDRESS}_1`]?.price?.value || 0,
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

  const balance = add(
    add(ethCurrencyBalance, bnbCurrencyBalance),
    maticCurrencyBalance,
  );

  const balanceDisplay = convertAmountToNativeDisplay(balance, currentCurrency);
  const lastTx = addressData?.summary.last_activity;

  return {
    balance: {
      amount: balance,
      display: balanceDisplay,
    },
    lastTx,
    isLoading,
  };
};
