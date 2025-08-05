import { oc } from '@orpc/contract';
import z from 'zod';

export const wipeContract = oc.output(z.void());
