import { isAddress } from '@ethersproject/address';
import { useMemo, useState } from 'react';
import { Address, useAccount, useEnsAddress, useEnsName } from 'wagmi';

import { ParsedAddressAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { isENSAddressFormat } from '~/core/utils/ethereum';

const useEns = ({ addressOrName }: { addressOrName: Address | string }) => {
  const { data: ensAddress } = useEnsAddress({
    name: addressOrName,
    enabled: isENSAddressFormat(addressOrName),
  });
  const { data: ensName } = useEnsName({
    address: addressOrName as Address,
    enabled: isAddress(addressOrName),
  });

  return {
    ensName: isENSAddressFormat(addressOrName)
      ? addressOrName
      : (ensName as string),
    ensAddress: isAddress(addressOrName)
      ? addressOrName
      : (ensAddress as Address),
  };
};

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

  //   const [to, setTo] = useState<Address>();
  //   const [from, setfrom] = useState<Address>();
  //   const [data, setData] = useState<string>();
  //   const [value, setValue] = useState<string>();
  //   const [gasLimit, setGasLimit] = useState<string>();
  //   const [token, setToken] = useState<ParsedAddressAsset>();

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
