import { isAddress } from '@ethersproject/address';
import { Address, useEnsAddress, useEnsName } from 'wagmi';

import { isENSAddressFormat } from '~/core/utils/ethereum';

export const useEns = ({
  addressOrName,
}: {
  addressOrName: Address | string;
}) => {
  const { data: ensAddress } = useEnsAddress({
    name: addressOrName,
    enabled: isENSAddressFormat(addressOrName),
  });
  const { data: ensName } = useEnsName({
    address: addressOrName as Address,
    enabled: isAddress(addressOrName),
  });

  return {
    ensName: isENSAddressFormat(addressOrName) ? addressOrName : ensName,
    ensAddress: isAddress(addressOrName) ? addressOrName : ensAddress,
  };
};
