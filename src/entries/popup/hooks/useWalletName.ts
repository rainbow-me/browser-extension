import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { useWalletNamesStore } from '~/core/state/walletNames';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';

export const useWalletName = ({ address }: { address?: Address }) => {
  const { data: ensName, error } = useEnsName({
    address,
    chainId: ChainId.mainnet,
  });
  console.log('-- useWalletName', ensName, error);
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
