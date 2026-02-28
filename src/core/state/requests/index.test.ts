import { beforeEach, describe, expect, test } from 'vitest';

import type { ProviderRequestPayload } from '../../provider/types';

import { usePendingRequestStore } from '.';

type TestRequest = ProviderRequestPayload;

const resetStore = () => {
  usePendingRequestStore.setState({ pendingRequests: [] });
};

describe('usePendingRequestStore', () => {
  beforeEach(() => {
    resetStore();
  });

  test('addPendingRequest adds requests to the store', () => {
    const { addPendingRequest } = usePendingRequestStore.getState();

    const req1: TestRequest = {
      id: 1,
      method: 'eth_requestAccounts',
      params: [],
    };
    const req2: TestRequest = { id: 2, method: 'eth_accounts', params: [] };

    expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([]);

    addPendingRequest(req1);
    expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
      req1,
    ]);

    addPendingRequest(req2);
    expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([
      req1,
      req2,
    ]);
  });

  test('approvePendingRequest removes the request and emits APPROVED', async () => {
    const { addPendingRequest, approvePendingRequest, waitForPendingRequest } =
      usePendingRequestStore.getState();
    const req: TestRequest = { id: 3, method: 'eth_sign', params: ['0xabc'] };
    addPendingRequest(req);

    // Start waiting for approval
    const waitPromise = waitForPendingRequest(3);

    // Approve the request
    const payload = { signature: '0xdeadbeef' };
    approvePendingRequest(3, payload);

    // Should be removed from pendingRequests
    expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([]);

    // Should resolve with APPROVED status and payload
    await expect(waitPromise).resolves.toStrictEqual({
      status: 'APPROVED',
      payload,
    });
  });

  test('rejectPendingRequest removes the request and emits REJECTED', async () => {
    const { addPendingRequest, rejectPendingRequest, waitForPendingRequest } =
      usePendingRequestStore.getState();
    const req: TestRequest = {
      id: 4,
      method: 'eth_sendTransaction',
      params: [{ to: '0x1' }],
    };
    addPendingRequest(req);

    // Start waiting for rejection
    const waitPromise = waitForPendingRequest(4);

    // Reject the request
    rejectPendingRequest(4);

    // Should be removed from pendingRequests
    expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([]);

    // Should resolve with REJECTED status and undefined payload
    await expect(waitPromise).resolves.toStrictEqual({
      status: 'REJECTED',
      payload: null,
    });
  });

  test('waitForPendingRequest resolves only when event is emitted', async () => {
    const { addPendingRequest, approvePendingRequest, waitForPendingRequest } =
      usePendingRequestStore.getState();
    const req: TestRequest = {
      id: 5,
      method: 'eth_getBalance',
      params: ['0x2'],
    };
    addPendingRequest(req);

    let resolved = false;
    const waitPromise = waitForPendingRequest(5).then(() => {
      resolved = true;
    });

    // Not resolved yet
    expect(resolved).toBe(false);

    // Approve the request
    approvePendingRequest(5, { balance: '100' });

    // Now it should resolve
    await waitPromise;
    expect(resolved).toBe(true);
  });

  test('multiple requests: approve and reject independently', async () => {
    const {
      addPendingRequest,
      approvePendingRequest,
      rejectPendingRequest,
      waitForPendingRequest,
    } = usePendingRequestStore.getState();
    const reqA: TestRequest = { id: 6, method: 'foo', params: [] };
    const reqB: TestRequest = { id: 7, method: 'bar', params: [] };
    addPendingRequest(reqA);
    addPendingRequest(reqB);

    const waitA = waitForPendingRequest(6);
    const waitB = waitForPendingRequest(7);

    approvePendingRequest(6, { ok: true });
    rejectPendingRequest(7);

    await expect(waitA).resolves.toStrictEqual({
      status: 'APPROVED',
      payload: { ok: true },
    });
    await expect(waitB).resolves.toStrictEqual({
      status: 'REJECTED',
      payload: null,
    });

    expect(usePendingRequestStore.getState().pendingRequests).toStrictEqual([]);
  });
});
