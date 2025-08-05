import { oc } from '@orpc/contract';
import z from 'zod';

export const testSandboxContract = oc.output(z.string());
