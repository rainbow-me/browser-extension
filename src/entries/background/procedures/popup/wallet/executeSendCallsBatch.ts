import { ORPCError } from '@orpc/client';
import { getAddress } from 'viem';

import { executeSendCallsBatch } from '~/core/sendCalls';
import { BatchStatus, useBatchStore } from '~/core/state';
import { RainbowError, logger } from '~/logger';

import { walletOs } from '../os';

export const executeSendCallsBatchHandler =
  walletOs.executeSendCallsBatch.handler(async ({ input }) => {
    const { sendParams, sender, app } = input;
    const from = getAddress(sender);

    const result = await executeSendCallsBatch({ sendParams, from });

    if (!result.success) {
      logger.error(new RainbowError('executeSendCallsBatch failed'), {
        error: result.error,
      });
      throw new ORPCError('EXECUTE_BATCH_FAILED', { message: result.error });
    }

    const batchId = sendParams.id;
    if (batchId) {
      const { setBatch, getBatchByKey } = useBatchStore.getState();
      const existing = getBatchByKey({
        id: batchId as `0x${string}`,
        sender: getAddress(sender) as `0x${string}`,
        app,
      });
      if (existing) {
        setBatch({
          ...existing,
          txHashes: result.txHashes,
          status: BatchStatus.Pending,
        });
      }
    }

    return { txHashes: result.txHashes };
  });
