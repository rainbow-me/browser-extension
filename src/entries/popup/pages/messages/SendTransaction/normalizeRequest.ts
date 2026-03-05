import { TransactionRequest } from '@ethersproject/abstract-provider';

import type { SendCallsParams } from '~/core/sendCalls/types';
import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';
import { ChainId } from '~/core/types/chains';

const isHexString = (v: unknown): v is `0x${string}` =>
  typeof v === 'string' && v.startsWith('0x');

const isSendCallsCall = (
  call: unknown,
): call is SendCallsParams['calls'][0] => {
  if (call === null || typeof call !== 'object') return false;
  const c = call as Record<string, unknown>;
  if (c.to !== undefined && !isHexString(c.to)) return false;
  if (c.data !== undefined && !isHexString(c.data)) return false;
  if (c.value !== undefined && !isHexString(c.value)) return false;
  return true;
};

export function isSendCallsParams(params: unknown): params is SendCallsParams {
  if (!params || typeof params !== 'object') return false;
  const p = params as Record<string, unknown>;
  if (typeof p.version !== 'string') return false;
  if (!isHexString(p.chainId)) return false;
  if (p.from !== undefined && !isHexString(p.from)) return false;
  if (!Array.isArray(p.calls)) return false;
  if (!p.calls.every(isSendCallsCall)) return false;
  if (p.id !== undefined && !isHexString(p.id)) return false;
  if (p.atomicRequired !== undefined && typeof p.atomicRequired !== 'boolean')
    return false;
  return true;
}

const isTransactionRequestLike = (p: unknown): p is TransactionRequest =>
  p !== null && typeof p === 'object' && !Array.isArray(p);

/**
 * Normalizes provider request to a TransactionRequest-like shape for display.
 * For wallet_sendCalls, uses the first call in the batch.
 */
export const getTransactionRequestFromRequest = (
  request: ProviderRequestPayload,
): TransactionRequest | null => {
  const params = request?.params?.[0];
  if (!params) return null;

  if (request.method === 'wallet_sendCalls') {
    if (!isSendCallsParams(params)) return null;
    const firstCall = params.calls?.[0];
    if (!firstCall) return null;
    return {
      from: params.from,
      to: firstCall.to,
      data: firstCall.data ?? '0x',
      value: firstCall.value ?? '0x0',
      chainId: Number(params.chainId),
    } as TransactionRequest;
  }

  if (!isTransactionRequestLike(params)) return null;
  return params;
};

export const isWalletSendCallsRequest = (
  request: ProviderRequestPayload,
): boolean => request?.method === 'wallet_sendCalls';

export const getSendCallsParams = (
  request: ProviderRequestPayload,
): SendCallsParams | null => {
  if (request?.method !== 'wallet_sendCalls') return null;
  const params = request?.params?.[0];
  return isSendCallsParams(params) ? params : null;
};

/**
 * ChainId for gas estimation and simulation. Prefers wallet_sendCalls batch
 * chain when present, otherwise falls back to session or mainnet.
 */
export const getChainIdForRequest = (
  request: ProviderRequestPayload,
  fallbackChainId?: number,
): number => {
  const sendParams = getSendCallsParams(request);
  const batchChainId = sendParams ? Number(sendParams.chainId) : undefined;
  return batchChainId ?? fallbackChainId ?? ChainId.mainnet;
};

/**
 * Returns all calls from a wallet_sendCalls batch as TransactionRequest-like objects.
 * Used for simulation and gas estimation of the full batch.
 */
const getTransactionRequestsFromBatch = (
  request: ProviderRequestPayload,
): TransactionRequest[] | null => {
  const params = getSendCallsParams(request);
  if (!params?.calls?.length) return null;

  return params.calls.map((call) => ({
    from: params.from,
    to: call.to,
    data: call.data ?? '0x',
    value: call.value ?? '0x0',
    chainId: Number(params.chainId),
  })) as TransactionRequest[];
};

/**
 * Unified accessor: returns TransactionRequest[] for both single (eth_sendTransaction)
 * and batch (wallet_sendCalls) requests. Single tx returns [tx], batch returns all calls.
 */
export const getTransactionRequestsFromRequest = (
  request: ProviderRequestPayload,
): TransactionRequest[] | null => {
  const batch = getTransactionRequestsFromBatch(request);
  if (batch) return batch;

  const single = getTransactionRequestFromRequest(request);
  return single ? [single] : null;
};
