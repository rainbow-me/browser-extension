import { oc } from '@orpc/contract';
import z from 'zod';

export const isMnemonicInVaultContract = oc
  .input(z.object({ secret: z.string() }))
  .output(z.object({ isInVault: z.boolean() }));
