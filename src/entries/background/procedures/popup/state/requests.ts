import { os } from '@orpc/server';
import z from 'zod';

import { usePendingRequestStore } from '~/core/state/requests';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

// Define schema for type safety
const requestSchema = z.custom<ProviderRequestPayload>();
const approveInputSchema = z.object({ id: z.number(), payload: z.unknown() });
const rejectInputSchema = z.object({ id: z.number() });

const getAllHandler = os.output(z.array(requestSchema)).handler(async () => {
  return usePendingRequestStore.getState().pendingRequests;
});

const approveHandler = os
  .input(approveInputSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    const { id, payload } = input;
    usePendingRequestStore.getState().approvePendingRequest(id, payload);
  });

const rejectHandler = os
  .input(rejectInputSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    const { id } = input;
    usePendingRequestStore.getState().rejectPendingRequest(id);
  });

export const requestsRouter = {
  getAll: getAllHandler,
  approve: approveHandler,
  reject: rejectHandler,
};
