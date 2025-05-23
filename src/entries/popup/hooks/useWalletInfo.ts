import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { useContactsStore } from '~/core/state/contacts';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { ChainId } from '~/core/types/chains';
import { truncateAddress } from '~/core/utils/address';

export const useWalletInfo = ({
  address = '' as Address,
}: {
  address?: Address;
}) => {
  const contacts = useContactsStore((state) => state.contacts);
  const { walletNames } = useWalletNamesStore();
  const { data: ensName } = useEnsName({ address, chainId: ChainId.mainnet });

  const contact = contacts[address];
  const walletName = walletNames[address];

  const isNameDefined = Boolean(walletName || contact?.name || ensName);

  return {
    contactName: contact?.name,
    contactAddress: contact?.address,
    displayName:
      walletName || contact?.name || ensName || truncateAddress(address),
    isContact: contact,
    isNameDefined,
    ensName,
    walletName,
  };
};
