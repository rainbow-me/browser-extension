import { oc } from '@orpc/contract';

import { addressSchema } from '~/core/schemas/address';

export const addContract = oc.input(addressSchema).output(addressSchema);
