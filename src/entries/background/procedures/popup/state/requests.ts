import { os } from '@orpc/server';
import z from 'zod';

import { usePendingRequestStore } from '~/core/state/requests';

// Define schema for type safety
const approveInputSchema = z.object({ id: z.number(), payload: z.unknown() });
const rejectInputSchema = z.object({ id: z.number() });

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
  approve: approveHandler,
  reject: rejectHandler,
};
