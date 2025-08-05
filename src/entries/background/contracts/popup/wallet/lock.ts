import { oc } from '@orpc/contract';
import z from 'zod';

export const lockContract = oc.output(z.void());
