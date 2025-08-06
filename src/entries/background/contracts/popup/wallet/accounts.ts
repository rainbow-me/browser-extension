import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const accountsContract = oc.output(z.array(addressSchema));
