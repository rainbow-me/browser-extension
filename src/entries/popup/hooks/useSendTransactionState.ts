import { parseEther } from 'ethers/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

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
  // const [asset, setAsset] = useState<ParsedAddressAsset>();
  const [independentAmount, setIndependentAmount] = useState<string>();
  const [independentField, setIndependentField] = useState<'native' | 'asset'>(
    'asset',
  );

  const asset = useNativeAssetForNetwork({ chainId: ChainId.mainnet });
  const { address: fromAddress } = useAccount();

  const { ensAddress: toAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  const chainId = useMemo(
    () => asset?.chainId ?? ChainId.mainnet,
    [asset?.chainId],
  );

  const sendingNativeAsset = useMemo(
    () => !!asset && isNativeAsset(asset?.address, chainId),
    [asset, chainId],
  );

  const { dependentAmount } = useMemo(() => {
    if (independentField === 'asset') {
      return {
        dependentAmount: convertAmountAndPriceToNativeDisplay(
          independentAmount as string,
          asset?.price?.value || 0,
          'USD',
        ).display,
      };
    } else {
      return {
        dependentAmount: convertAmountFromNativeValue(
          independentAmount as string,
          asset?.price?.value || 0,
          asset?.decimals,
        ),
      };
    }
  }, [
    asset?.decimals,
    asset?.price?.value,
    independentAmount,
    independentField,
  ]);

  const amount = useMemo(() => {
    if (independentField === 'asset') return independentAmount;
    return dependentAmount;
  }, [dependentAmount, independentAmount, independentField]);

  const value = useMemo(
    () => (sendingNativeAsset && amount ? parseEther(amount) : '0'),
    [amount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (!asset || !toAddress || !amount || sendingNativeAsset) return '0x';
    const rawAmount = convertAmountToRawAmount(amount, asset?.decimals);
    return getDataForTokenTransfer(rawAmount, toAddress);
  }, [amount, asset, sendingNativeAsset, toAddress]);

  const switchIndependentField = useCallback(() => {
    setIndependentField(independentField === 'asset' ? 'native' : 'asset');
  }, [independentField]);

  return {
    amount,
    toAddressOrName,
    independentAmount,
    dependentAmount,
    chainId,
    data,
    fromAddress,
    independentField,
    toAddress,
    toEnsName,
    value,
    setIndependentAmount,
    setIndependentField,
    setToAddressOrName,
    switchIndependentField,
  };
};
