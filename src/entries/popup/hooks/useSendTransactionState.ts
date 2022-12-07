import { isAddress } from '@ethersproject/address';
import { useState } from 'react';
import { Address, useEnsAddress, useEnsName } from 'wagmi';

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

  const { ensAddress: toAddress, ensName: toEnsName } = useEns({
    addressOrName: toAddressOrName ?? '',
  });

  //   const [to, setTo] = useState<Address>();
  //   const [from, setfrom] = useState<Address>();
  //   const [data, setData] = useState<string>();
  //   const [value, setValue] = useState<string>();
  //   const [gasLimit, setGasLimit] = useState<string>();
  //   const [token, setToken] = useState<ParsedAddressAsset>();

  return { toAddress, toEnsName, setToAddressOrName };
};
