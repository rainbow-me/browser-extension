import {
  type BatchCall,
  executeBatchedTransaction,
  supportsDelegation,
} from '@rainbow-me/delegation';
import { Address } from 'viem';

import { getDelegationEnabled } from '~/core/resources/delegations/featureStatus';
import { useGasStore } from '~/core/state';
import { type NewTransaction } from '~/core/types/transactions';
import { toHex } from '~/core/utils/hex';
import { addNewTransaction, getNextNonce } from '~/core/utils/transactions';
import { getViemClient } from '~/core/viem/clients';
import { getViemWalletClient } from '~/core/viem/walletClient';

import type { SendCallsParams } from './types';

export type ExecuteSendCallsBatchResult =
  | { success: true; txHashes: `0x${string}`[] }
  | { success: false; error: string };

/**
 * Execute a wallet_sendCalls batch via delegation SDK.
 * Errors out if delegation is not supported or execution fails.
 */
export async function executeSendCallsBatch({
  sendParams,
  from,
}: {
  sendParams: SendCallsParams;
  from: Address;
}): Promise<ExecuteSendCallsBatchResult> {
  const chainId = Number(sendParams.chainId);

  const calls: BatchCall[] = sendParams.calls.map((call) => ({
    to: (call.to ?? '0x0000000000000000000000000000000000000000') as Address,
    value: toHex(BigInt(call.value ?? '0x0')) as `0x${string}`,
    data: (call.data ?? '0x') as `0x${string}`,
  }));

  if (!calls.length) {
    return { success: false, error: 'No calls to execute' };
  }

  const totalValue = calls.reduce(
    (sum, c) => sum + BigInt(c.value ?? 0),
    BigInt(0),
  );

  const delegationEnabled = getDelegationEnabled();
  const { supported } = await supportsDelegation({ address: from, chainId });
  const walletClient = await getViemWalletClient({ address: from, chainId });

  if (!delegationEnabled || !supported || !walletClient) {
    return {
      success: false,
      error: 'Delegation not supported for this wallet or chain',
    };
  }

  const gas = useGasStore.getState().selectedGas.transactionGasParams;
  const maxFee = (gas as { maxFeePerGas?: string }).maxFeePerGas;
  const maxPriority = (gas as { maxPriorityFeePerGas?: string })
    .maxPriorityFeePerGas;
  if (!maxFee || !maxPriority) {
    return {
      success: false,
      error: 'EIP-1559 gas params required for delegation',
    };
  }

  try {
    const publicClient = getViemClient({ chainId });
    const nonce = await getNextNonce({ address: from, chainId });
    const result = await executeBatchedTransaction({
      calls,
      walletClient,
      publicClient,
      chainId,
      value: totalValue,
      transactionOptions: {
        maxFeePerGas: BigInt(maxFee),
        maxPriorityFeePerGas: BigInt(maxPriority),
        gasLimit: null,
      },
      nonce,
    });

    if (!result.hash) {
      return { success: false, error: 'Transaction failed - no hash returned' };
    }

    const transaction: NewTransaction = {
      hash: result.hash,
      nonce: nonce ?? -2,
      chainId,
      from,
      to: calls[0]?.to as Address,
      data: calls[0]?.data,
      value: totalValue.toString(),
      status: 'pending',
      type: 'contract_interaction',
      batch: true,
      delegation: result.type === 'eip7702',
      maxFeePerGas: maxFee,
      maxPriorityFeePerGas: maxPriority,
    };

    addNewTransaction({ address: from, chainId, transaction });

    return { success: true, txHashes: [result.hash] };
  } catch (error) {
    return {
      success: false,
      error: (error as Error)?.message ?? 'Transaction failed',
    };
  }
}
