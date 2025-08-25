import { oc } from '@orpc/contract';
import z from 'zod';

import { addressSchema } from '~/core/schemas/address';

export const removeContract = oc.input(addressSchema).output(z.boolean());
