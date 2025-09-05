import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const createContract = oc.output(z.object({ address: addressSchema }));
