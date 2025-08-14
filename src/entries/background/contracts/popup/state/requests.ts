import { oc } from '@orpc/contract';
import z from 'zod';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

const requestSchema = z.custom<ProviderRequestPayload>();

export const getRequestsContract = oc.output(z.array(requestSchema));

export const approveRequestContract = oc
  .input(z.object({ id: z.number(), payload: z.unknown() }))
  .output(z.void());

export const rejectRequestContract = oc
  .input(z.object({ id: z.number() }))
  .output(z.void());

export default {
  getAll: getRequestsContract,
  approve: approveRequestContract,
  reject: rejectRequestContract,
};
