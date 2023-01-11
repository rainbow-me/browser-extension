import { Address, useEnsName } from 'wagmi';

import { useWalletNamesStore } from '~/core/state/walletNames';
import { truncateAddress } from '~/core/utils/address';

export const useWalletName = ({ address }: { address: Address }) => {
  const { data: ensName } = useEnsName({ address });
  const { walletNames } = useWalletNamesStore();

  const displayName =
    walletNames[address] || ensName || truncateAddress(address);
  const showAddress = walletNames[address] || ensName;

  return {
    displayName,
    showAddress,
  };
};
