import { oc } from '@orpc/contract';
import z from 'zod';

export const statusContract = oc.output(
  z.object({
    hasVault: z.boolean(),
    unlocked: z.boolean(),
    passwordSet: z.boolean(),
    ready: z.boolean(),
  }),
);
