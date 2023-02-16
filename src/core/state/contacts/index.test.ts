import { expect, test } from 'vitest';

import { DEFAULT_ACCOUNT, DEFAULT_ACCOUNT_2 } from '~/core/utils/defaults';

import { contactsStore } from '.';

const ACCOUNT_NAME_1 = 'ACCOUNT NAME 1';
const ACCOUNT_NAME_2 = 'ACCOUNT NAME 2';

test('should be able to save contact', async () => {
  const { contacts, saveContact } = contactsStore.getState();
  expect(contacts).toStrictEqual({});

  saveContact({ contact: { address: DEFAULT_ACCOUNT, name: ACCOUNT_NAME_1 } });
  expect(contactsStore.getState().contacts).toStrictEqual({
    [DEFAULT_ACCOUNT]: { address: DEFAULT_ACCOUNT, name: ACCOUNT_NAME_1 },
  });
  saveContact({
    contact: { address: DEFAULT_ACCOUNT_2, name: ACCOUNT_NAME_2 },
  });
  expect(contactsStore.getState().contacts).toStrictEqual({
    [DEFAULT_ACCOUNT]: { address: DEFAULT_ACCOUNT, name: ACCOUNT_NAME_1 },
    [DEFAULT_ACCOUNT_2]: { address: DEFAULT_ACCOUNT_2, name: ACCOUNT_NAME_2 },
  });
});

test('should be able to delete contact', async () => {
  const { deleteContact } = contactsStore.getState();
  deleteContact({ address: DEFAULT_ACCOUNT });
  expect(contactsStore.getState().contacts).toStrictEqual({
    [DEFAULT_ACCOUNT_2]: { address: DEFAULT_ACCOUNT_2, name: ACCOUNT_NAME_2 },
  });
});

test('should be able to verify if is contact', async () => {
  const { isContact } = contactsStore.getState();
  const contact = isContact({ address: DEFAULT_ACCOUNT_2 });
  expect(contact).toBe(true);
});

test('should be able to get contact', async () => {
  const { getContact } = contactsStore.getState();
  const contact = getContact({ address: DEFAULT_ACCOUNT_2 });
  expect(contact).toStrictEqual({
    address: DEFAULT_ACCOUNT_2,
    name: ACCOUNT_NAME_2,
  });
});
