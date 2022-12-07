import { useMemo, useState } from 'react';
import { Address, useAccount } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';

import { useEns } from './useEns';

export const useSendTransactionState = () => {
  const [toAddressOrName, setToAddressOrName] = useState<Address | string>('');
  const [asset, setAsset] = useState<ParsedAddressAsset>();
  const [amount, setAmount] = useState<string>();
  const { address: fromAddress } = useAccount();

  const { ensAddress: toAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  const chainId = useMemo(
    () => asset?.chainId ?? ChainId.mainnet,
    [asset?.chainId],
  );

  const data = useMemo(() => {
    return undefined;
  }, []);

  return {
    toAddressOrName,
    amount,
    chainId,
    data,
    fromAddress,
    toAddress,
    toEnsName,
    setAmount,
    setAsset,
    setToAddressOrName,
  };
};
