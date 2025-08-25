import { os } from '@orpc/server';
import z from 'zod';

// Schema for ping response
const PingResponseSchema = z.object({
  payload: z.literal('pong'),
});

// Ping handler (equivalent to current keep alive)
const pingHandler = os.output(PingResponseSchema).handler(async () => {
  return { payload: 'pong' };
});

export const healthRouter = {
  ping: pingHandler,
};
