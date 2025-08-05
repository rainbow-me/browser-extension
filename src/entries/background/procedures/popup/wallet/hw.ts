import { eventIterator, os } from '@orpc/server';
import z from 'zod';

import {
  hwRequestPublisher,
  hwResponsePublisher,
} from '~/core/messengers/hwEventPublishers';

// Hardware wallet request schema
const hwRequestSchema = z.object({
  requestId: z.string(),
  action: z.enum(['signTransaction', 'signMessage', 'signTypedData']),
  vendor: z.enum(['Ledger', 'Trezor']),
  payload: z.any(), // Transaction, message, or typed data
});

// Hardware wallet response schema
const hwResponseSchema = z.object({
  requestId: z.string(),
  result: z.union([z.string(), z.object({ error: z.string() })]),
});

// Stream hardware wallet requests to popup
const hwRequestStreamHandler = os
  .output(eventIterator(hwRequestSchema))
  .handler(async function* ({ signal }) {
    try {
      for await (const request of hwRequestPublisher.subscribe('hw-request', {
        signal,
      })) {
        yield request;
      }
    } finally {
      // Cleanup when stream ends or client disconnects
      console.log('Hardware wallet request stream ended');
    }
  });

// Handle hardware wallet responses from popup
const hwResponseHandler = os
  .input(hwResponseSchema)
  .output(z.void())
  .handler(async ({ input }) => {
    // Publish the response to the response stream
    hwResponsePublisher.publish('hw-response', {
      requestId: input.requestId,
      result: input.result,
    });
  });

export const hwRouter = {
  requestStream: hwRequestStreamHandler,
  response: hwResponseHandler,
};
