import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { useWalletNamesStore } from '~/core/state/walletNames';
import { truncateAddress } from '~/core/utils/address';

export const useWalletName = ({ address }: { address?: Address }) => {
  const { data: ensName } = useEnsName({ address });
  const { walletNames } = useWalletNamesStore();

  if (!address) {
    return {
      displayName: undefined,
      showAddress: undefined,
    };
  }

  const displayName =
    walletNames[address] || ensName || truncateAddress(address);
  const showAddress = walletNames[address] || ensName;

  return {
    displayName,
    showAddress,
  };
};
