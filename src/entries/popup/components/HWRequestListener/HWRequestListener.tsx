/* eslint-disable @typescript-eslint/no-explicit-any */

import { TransactionRequest } from '@ethersproject/providers';
import { useEffect } from 'react';
import { Address, ByteArray } from 'viem';

import { popupClient } from '../../handlers/background';
import {
  personalSign,
  signTransactionFromHW,
  signTypedData,
} from '../../handlers/wallet';

interface HWSigningRequest {
  requestId: string;
  action: 'signTransaction' | 'signMessage' | 'signTypedData';
  vendor: 'Ledger' | 'Trezor';
  payload:
    | TransactionRequest
    | { message: string; address: string }
    | { data: string | ByteArray; address: string };
}

function isMessagePayload(
  payload: any,
): payload is { message: string; address: string } {
  return 'message' in payload && 'address' in payload;
}
function isTypedDataPayload(
  payload: any,
): payload is { data: any; address: string } {
  return 'data' in payload && 'address' in payload;
}

const processHwSigningRequest = async (data: HWSigningRequest) => {
  try {
    let response;
    switch (data.action) {
      case 'signTransaction':
        response = await signTransactionFromHW(
          data.payload as TransactionRequest,
          data.vendor,
        );
        break;
      case 'signMessage':
        if (isMessagePayload(data.payload)) {
          response = await personalSign(
            data.payload.message,
            data.payload.address as Address,
          );
        }
        break;
      case 'signTypedData':
        if (isTypedDataPayload(data.payload)) {
          response = await signTypedData(
            data.payload.data,
            data.payload.address as Address,
          );
        }
        break;
    }
    return response;
  } catch (e: any) {
    return { error: e?.name || e, nonce: 0 };
  }
};

export const HWRequestListener = () => {
  useEffect(() => {
    const abortController = new AbortController();

    const subscribeToHWRequests = async () => {
      try {
        const stream = await popupClient.wallet.hw.requestStream({
          signal: abortController.signal,
        });

        for await (const request of stream) {
          // Process the hardware wallet request
          const response = await processHwSigningRequest(request);

          // Send the response back to background
          await popupClient.wallet.hw.response({
            requestId: request.requestId,
            result: response || { error: 'Unknown error' },
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Hardware wallet request listener error:', error);
        }
      }
    };

    subscribeToHWRequests();

    return () => {
      abortController.abort();
    };
  }, []);

  return null;
};
