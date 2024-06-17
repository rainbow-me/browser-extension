import { Address } from 'viem';
import { useEnsName } from 'wagmi';

import { ContactsStore, useContactsStore } from '~/core/state/contacts';
import { ChainId } from '~/core/types/chains';

import { useEnhanceWithEnsNames } from './useEnhanceWithEnsNames';

export const useContact = ({ address }: { address: Address | undefined }) => {
  const { getContact } = useContactsStore();
  const { data: ensName } = useEnsName({ address, chainId: ChainId.mainnet });

  const contactStore = getContact({ address });
  const display = contactStore?.name || ensName;
  return {
    ensName,
    display,
    ...(contactStore || {}),
    isContact: !!contactStore,
  };
};

const selectContactsList = (s: ContactsStore) => Object.values(s.contacts);
export const useContacts = () => {
  const contacts = useContactsStore(selectContactsList);
  const contactsWithEnsNames = useEnhanceWithEnsNames({ accounts: contacts });
  return contactsWithEnsNames;
};
