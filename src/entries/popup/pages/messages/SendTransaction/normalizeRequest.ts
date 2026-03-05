import { TransactionRequest } from '@ethersproject/abstract-provider';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

export type SendCallsParams = {
  version: string;
  chainId: `0x${string}`;
  from?: `0x${string}`;
  calls: Array<{
    to?: `0x${string}`;
    data?: `0x${string}`;
    value?: `0x${string}`;
  }>;
  id?: `0x${string}`;
  atomicRequired?: boolean;
};

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

export function isTransactionRequestLike(
  params: unknown,
): params is TransactionRequest {
  return (
    params !== null && typeof params === 'object' && !Array.isArray(params)
  );
}

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
