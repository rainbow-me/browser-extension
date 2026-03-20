import { TransactionRequest } from '@ethersproject/abstract-provider';
import {
  type BatchCall,
  type Transaction as DelegationPreparedTransaction,
  prepareBatchedTransaction,
} from '@rainbow-me/delegation';
import { type Address, zeroAddress } from 'viem';

import type { SendCallsParams } from './types';

export function sendCallsParamsToBatchCalls(
  sendParams: SendCallsParams,
): BatchCall[] {
  return sendParams.calls.map((call) => ({
    to: call.to ?? zeroAddress,
    value: call.value ?? '0x0',
    data: call.data ?? '0x',
  }));
}

/**
 * Provisional nonce is only passed through to the delegation SDK for simulation
 * calldata shape; the real nonce is applied at broadcast.
 */
export async function prepareSendCallsEnvelope({
  sendParams,
  from,
  provisionalNonce,
}: {
  sendParams: SendCallsParams;
  from: Address;
  provisionalNonce: number;
}): Promise<DelegationPreparedTransaction> {
  const calls = sendCallsParamsToBatchCalls(sendParams);
  const chainId = Number(sendParams.chainId);
  return prepareBatchedTransaction({
    from,
    calls,
    chainId,
    nonce: provisionalNonce,
  });
}

export function envelopeToTransactionRequest(
  envelope: DelegationPreparedTransaction,
  chainId: number,
  fromFallback?: Address,
): TransactionRequest {
  return {
    from: fromFallback ?? envelope.from,
    to: envelope.to,
    data: envelope.data,
    value: envelope.value,
    chainId,
  };
}
