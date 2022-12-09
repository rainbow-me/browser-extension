import { parseEther } from 'ethers/lib/utils';
import { useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

import { useCurrentCurrencyStore } from '~/core/state';
import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isNativeAsset } from '~/core/utils/chains';
import { convertAmountToRawAmount } from '~/core/utils/numbers';
import { getDataForTokenTransfer } from '~/core/utils/transactions';

import { useEns } from '../useEns';
import { useNativeAssetForNetwork } from '../useNativeAssetForNetwork';

export const useSendTransactionState = ({
  assetAmount,
}: {
  assetAmount?: string;
}) => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const nativeAsset = useNativeAssetForNetwork({ chainId: ChainId.mainnet });
  const { currentCurrency } = useCurrentCurrencyStore();

  const [, setAsset] = useState<ParsedAddressAsset>();

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

  const value = useMemo(
    () => (sendingNativeAsset && assetAmount ? parseEther(assetAmount) : '0'),
    [assetAmount, sendingNativeAsset],
  );

  const data = useMemo(() => {
    if (!asset || !toAddress || !assetAmount || sendingNativeAsset) return '0x';
    const rawAmount = convertAmountToRawAmount(assetAmount, asset?.decimals);
    return getDataForTokenTransfer(rawAmount, toAddress);
  }, [assetAmount, asset, sendingNativeAsset, toAddress]);

  return {
    asset,
    currentCurrency,
    toAddressOrName,
    chainId,
    data,
    fromAddress,
    toAddress,
    toEnsName,
    value,
    setAsset,
    setToAddressOrName,
  };
};
