import { Address } from 'wagmi';
import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface Contact {
  name: string;
  address: Address;
}

export interface ContactsStore {
  contacts: { [address: Address]: Contact };
  getContact: ({ address }: { address: Address }) => Contact | undefined;
  isContact: ({ address }: { address: Address }) => boolean;
  saveContact: ({ contact }: { contact: Contact }) => void;
  editContact: ({ contact }: { contact: Contact }) => void;
  deleteContact: ({ address }: { address: Address }) => void;
}

export const contactsStore = createStore<ContactsStore>(
  (set, get) => ({
    contacts: {},
    getContact: ({ address }) => {
      const newContacts = get().contacts;
      return newContacts[address];
    },
    isContact: ({ address }) => {
      return Boolean(get().contacts[address]);
    },
    saveContact: ({ contact }) => {
      const newContacts = get().contacts;
      newContacts[contact.address] = contact;
      set({ contacts: newContacts });
    },
    editContact: ({ contact }) => {
      const newContacts = get().contacts;
      newContacts[contact.address] = contact;
      set({ contacts: newContacts });
    },
    deleteContact: ({ address }) => {
      const newContacts = get().contacts;
      delete newContacts[address];
      set({ contacts: newContacts });
    },
  }),
  {
    persist: {
      name: 'contacts',
      version: 0,
    },
  },
);

export const useContactsStore = create(contactsStore);
