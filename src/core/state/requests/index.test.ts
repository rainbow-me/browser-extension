import { expect, test } from 'vitest';

import { usePendingRequestStore } from '.';

test('should be able to add request', async () => {
  const { pendingRequests, addPendingRequest } =
    usePendingRequestStore.getState();
  expect(pendingRequests).toStrictEqual([]);

  addPendingRequest({ id: 1, method: 'eth_requestAccounts', params: [] });
  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 1, method: 'eth_requestAccounts', params: [] },
  ]);
  addPendingRequest({ id: 2, method: 'eth_accounts', params: [] });

  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 1, method: 'eth_requestAccounts', params: [] },
    { id: 2, method: 'eth_accounts', params: [] },
  ]);
});

test('should be able to remove request', async () => {
  const { removePendingRequest } = usePendingRequestStore.getState();
  removePendingRequest(1);
  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 2, method: 'eth_accounts', params: [] },
  ]);
});
