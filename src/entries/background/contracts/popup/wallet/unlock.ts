import { oc } from '@orpc/contract';
import z from 'zod';

export const unlockContract = oc
  .input(z.object({ password: z.string() }))
  .output(z.boolean());
