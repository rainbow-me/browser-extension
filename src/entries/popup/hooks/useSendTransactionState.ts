import { parseEther } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { convertAmountToRawAmount } from '~/core/utils/numbers';
import { getDataForTokenTransfer } from '~/core/utils/transactions';

import { useEns } from './useEns';

export const useSendTransactionState = () => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const [asset, setAsset] = useState<ParsedAddressAsset>();
  const [amount, setAmount] = useState<string>();
  const [independentField, setIndependentField] = useState<
    'native' | 'asset'
  >();
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

  const value = useMemo(
    () => (sendingNativeAsset && amount ? parseEther(amount) : '0'),
    [amount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (!asset || !toAddress || !amount || sendingNativeAsset) return '0x';
    const rawAmount = convertAmountToRawAmount(amount, asset?.decimals);
    return getDataForTokenTransfer(rawAmount, toAddress);
  }, [amount, asset, sendingNativeAsset, toAddress]);

  console.log('dataatatatatata ', data);

  return {
    toAddressOrName,
    amount,
    chainId,
    data,
    fromAddress,
    independentField,
    toAddress,
    toEnsName,
    value,
    setAmount,
    setAsset,
    setIndependentField,
    setToAddressOrName,
  };
};
