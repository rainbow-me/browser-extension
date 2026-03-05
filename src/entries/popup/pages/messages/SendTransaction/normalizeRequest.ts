import { TransactionRequest } from '@ethersproject/abstract-provider';

import { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

type SendCallsParams = {
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
    const sendParams = params as SendCallsParams;
    const firstCall = sendParams.calls?.[0];
    if (!firstCall) return null;
    return {
      from: sendParams.from,
      to: firstCall.to,
      data: firstCall.data ?? '0x',
      value: firstCall.value ?? '0x0',
      chainId: Number(sendParams.chainId),
    } as TransactionRequest;
  }

  return params as TransactionRequest;
};

export const isWalletSendCallsRequest = (
  request: ProviderRequestPayload,
): boolean => request?.method === 'wallet_sendCalls';

export const getSendCallsParams = (
  request: ProviderRequestPayload,
): SendCallsParams | null =>
  request?.method === 'wallet_sendCalls'
    ? (request?.params?.[0] as SendCallsParams)
    : null;
