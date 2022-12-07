import { parseEther } from 'ethers/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import {
  convertAmountAndPriceToNativeDisplay,
  convertAmountFromNativeValue,
  convertAmountToRawAmount,
} from '~/core/utils/numbers';
import { getDataForTokenTransfer } from '~/core/utils/transactions';

import { useEns } from './useEns';
import { useNativeAssetForNetwork } from './useNativeAssetForNetwork';

export const useSendTransactionState = () => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const nativeAsset = useNativeAssetForNetwork({ chainId: ChainId.mainnet });

  const [, setAsset] = useState<ParsedAddressAsset>(nativeAsset);
  const [independentAmount, setIndependentAmount] = useState<string>();
  const { currentCurrency } = useCurrentCurrencyStore();
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );

  const asset = nativeAsset;

  const { address: fromAddress } = useAccount();
  const chainId = asset?.chainId ?? ChainId.mainnet;

  const { ensAddress: toAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  const sendingNativeAsset = useMemo(
    () => !!asset && isNativeAsset(asset?.address, chainId),
    [asset, chainId],
  );

  const dependentAmount = useMemo(() => {
    if (independentField === 'asset') {
      return convertAmountAndPriceToNativeDisplay(
        independentAmount as string,
        asset?.price?.value || 0,
        currentCurrency,
      ).amount;
    } else {
      return convertAmountFromNativeValue(
        independentAmount as string,
        asset?.price?.value || 0,
        asset?.decimals,
      );
    }
  }, [
    asset?.decimals,
    asset?.price?.value,
    currentCurrency,
    independentAmount,
    independentField,
  ]);

  const assetAmount = useMemo(() => {
    if (independentField === 'asset') return independentAmount;
    return dependentAmount;
  }, [dependentAmount, independentAmount, independentField]);

  const value = useMemo(
    () => (sendingNativeAsset && assetAmount ? parseEther(assetAmount) : '0'),
    [assetAmount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (!asset || !toAddress || !assetAmount || sendingNativeAsset) return '0x';
    const rawAmount = convertAmountToRawAmount(assetAmount, asset?.decimals);
    return getDataForTokenTransfer(rawAmount, toAddress);
  }, [assetAmount, asset, sendingNativeAsset, toAddress]);

  const switchIndependentField = useCallback(() => {
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [independentField]);

  return {
    asset,
    assetAmount,
    currentCurrency,
    toAddressOrName,
    independentAmount,
    independentField,
    dependentAmount,
    chainId,
    data,
    fromAddress,
    toAddress,
    toEnsName,
    value,
    setAsset,
    setIndependentAmount,
    setIndependentField,
    setToAddressOrName,
    switchIndependentField,
  };
};
