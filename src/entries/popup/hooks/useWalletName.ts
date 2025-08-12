import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { useWalletNamesStore } from '~/core/state/walletNames';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';

export const useWalletName = ({ address }: { address?: Address }) => {
  const { data: ensName, isLoading: isEnsLoading } = useEnsName({
    address,
    chainId: ChainId.mainnet,
  });

  const { walletNames } = useWalletNamesStore();

  if (!address) {
    return {
      displayName: undefined,
      showAddress: undefined,
      isLoading: false,
    };
  }

  const displayName =
    walletNames[address] || ensName || truncateAddress(address);
  const showAddress = walletNames[address] || ensName;

  return {
    displayName,
    showAddress,
    isLoading: walletNames[address] ? false : isEnsLoading,
  };
};
