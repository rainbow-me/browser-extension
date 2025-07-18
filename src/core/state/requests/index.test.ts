import { expect, test } from 'vitest';

import { usePendingRequestStore } from '.';

test('should be able to add request', async () => {
  const { pendingRequests, addPendingRequest } =
    usePendingRequestStore.getState();
  expect(pendingRequests).toStrictEqual([]);

  const result1 = addPendingRequest({
    id: 1,
    method: 'eth_requestAccounts',
    params: [],
  });
  expect(result1).toBe(true);
  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 1, method: 'eth_requestAccounts', params: [] },
  ]);
  const result2 = addPendingRequest({
    id: 2,
    method: 'eth_accounts',
    params: [],
  });
  expect(result2).toBe(true);

  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 1, method: 'eth_requestAccounts', params: [] },
    { id: 2, method: 'eth_accounts', params: [] },
  ]);
});

test('should prevent duplicate eth_requestAccounts requests from same host', async () => {
  const { addPendingRequest } = usePendingRequestStore.getState();

  // Clear any existing requests
  usePendingRequestStore.setState({ pendingRequests: [] });

  const request1 = {
    id: 3,
    method: 'eth_requestAccounts',
    params: [],
    meta: {
      sender: { url: 'https://example.com' },
      topic: 'test_topic',
    },
  };

  const request2 = {
    id: 4,
    method: 'eth_requestAccounts',
    params: [],
    meta: {
      sender: { url: 'https://example.com' },
      topic: 'test_topic',
    },
  };

  const result1 = addPendingRequest(request1);
  expect(result1).toBe(true);
  expect(usePendingRequestStore.getState().pendingRequests).toHaveLength(1);

  const result2 = addPendingRequest(request2);
  expect(result2).toBe(false); // Should be rejected as duplicate
  expect(usePendingRequestStore.getState().pendingRequests).toHaveLength(1); // Still only one request
});

test('should be able to remove request', async () => {
  // Clear any existing requests and set up the test state
  usePendingRequestStore.setState({ pendingRequests: [] });

  const { addPendingRequest, removePendingRequest } =
    usePendingRequestStore.getState();

  // Add the test requests
  addPendingRequest({
    id: 1,
    method: 'eth_requestAccounts',
    params: [],
  });
  addPendingRequest({
    id: 2,
    method: 'eth_accounts',
    params: [],
  });

  // Verify initial state
  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 1, method: 'eth_requestAccounts', params: [] },
    { id: 2, method: 'eth_accounts', params: [] },
  ]);

  // Remove request with id 1
  removePendingRequest(1);

  // Verify only request with id 2 remains
  expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
    { id: 2, method: 'eth_accounts', params: [] },
  ]);
});
