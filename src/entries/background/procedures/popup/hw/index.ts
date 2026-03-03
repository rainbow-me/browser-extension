import { os } from '@orpc/server';
import z from 'zod';

import { useHWRequestsStore } from '~/core/state/hwRequests';
import { HWSigningResponse } from '~/core/types/hw';

// Use raw os handlers without contract to avoid type complexity
// The store's PendingHWRequest type is complex due to discriminated unions

export const hwRouter = {
  getPendingHWRequests: os.handler(async () => {
    const requests = useHWRequestsStore.getState().pendingHWRequests;
    // Return as-is, client will handle the discriminated union
    return requests;
  }),

  respondToHWRequest: os
    .input(
      z.object({
        id: z.number(),
        response: z.union([z.string(), z.object({ error: z.string() })]),
      }),
    )
    .output(z.void())
    .handler(async ({ input: { id, response } }) => {
      useHWRequestsStore
        .getState()
        .respondToHWRequest(id, response as HWSigningResponse);
    }),
};
