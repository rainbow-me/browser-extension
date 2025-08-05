import { oc } from '@orpc/contract';
import z from 'zod';

import { keychainWalletSchema } from './wallet';

export const walletsContract = oc.output(z.array(keychainWalletSchema));
