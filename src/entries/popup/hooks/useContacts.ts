import { Address, useEnsName } from 'wagmi';

import { useContactsStore } from '~/core/state/contacts';

export const useContact = ({ address }: { address: Address | undefined }) => {
  const { getContact } = useContactsStore();
  const { data: ensName } = useEnsName({ address });

  const contactStore = getContact({ address });
  const display = contactStore?.name || ensName;
  return {
    ensName,
    display,
    ...(contactStore || {}),
    isContact: !!contactStore,
  };
};
