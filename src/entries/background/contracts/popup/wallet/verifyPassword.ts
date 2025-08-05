import { oc } from '@orpc/contract';
import z from 'zod';

export const verifyPasswordContract = oc
  .input(z.object({ password: z.string() }))
  .output(z.boolean());
