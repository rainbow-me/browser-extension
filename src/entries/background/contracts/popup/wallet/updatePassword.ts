import { oc } from '@orpc/contract';
import z from 'zod';

export const updatePasswordContract = oc
  .input(
    z.object({
      password: z.string(),
      newPassword: z.string(),
    }),
  )
  .output(z.void());
