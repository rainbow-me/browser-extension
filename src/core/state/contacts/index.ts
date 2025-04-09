import { Address } from 'viem';

import { createRainbowStore } from '../internal/createRainbowStore';

export interface Contact {
  name: string;
  address: Address;
}

export interface ContactsStore {
  contacts: { [address: Address]: Contact };
  getContact: ({
    address,
  }: {
    address: Address | undefined;
  }) => Contact | undefined;
  isContact: ({ address }: { address: Address }) => boolean;
  saveContact: ({ contact }: { contact: Contact }) => void;
  deleteContact: ({ address }: { address: Address }) => void;
}

export const useContactsStore = createRainbowStore<ContactsStore>(
  (set, get) => ({
    contacts: {},
    getContact: ({ address }) => {
      const newContacts = get().contacts;
      return address ? newContacts[address] : undefined;
    },
    isContact: ({ address }) => {
      return Boolean(get().contacts[address]);
    },
    saveContact: ({ contact }) => {
      const contacts = get().contacts;
      const newContacts = {
        ...contacts,
        [contact.address]: contact,
      };
      set({ contacts: newContacts });
    },
    deleteContact: ({ address }) => {
      const contacts = get().contacts;
      delete contacts[address];
      set({ contacts: { ...contacts } });
    },
  }),
  {
    storageKey: 'contacts',
    version: 0,
  },
);
