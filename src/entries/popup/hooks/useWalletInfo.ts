import { Address, useEnsName } from 'wagmi';

import { useContactsStore } from '~/core/state/contacts';
import { useWalletNamesStore } from '~/core/state/walletNames';
import { truncateAddress } from '~/core/utils/address';

export const useWalletInfo = ({
  address = '' as Address,
}: {
  address?: Address;
}) => {
  const contacts = useContactsStore.use.contacts();
  const { walletNames } = useWalletNamesStore();
  const { data: ensName } = useEnsName({ address });

  const contact = contacts[address];
  const walletName = walletNames[address];

  const isNameDefined = Boolean(walletName || contact?.name || ensName);

  return {
    contactName: contact?.name,
    displayName:
      walletName || contact?.name || ensName || truncateAddress(address),
    isContact: contact,
    isNameDefined,
    ensName,
    walletName,
  };
};
