/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransactionRequest } from '@ethersproject/providers';
import { Bytes } from 'ethers';
import { useEffect } from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';

import {
  personalSign,
  signTransactionFromHW,
  signTypedData,
} from '../../handlers/wallet';
import { isExternalPopup } from '../../utils/windows';

export const HWRequestListener = () => {
  const bgMessenger = initializeMessenger({ connect: 'background' });

  interface HWSigningRequest {
    action: 'signTransaction' | 'signMessage' | 'signTypedData';
    vendor: 'Ledger' | 'Trezor';
    payload:
      | TransactionRequest
      | { message: string; address: string }
      | { data: string | Bytes; address: string };
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

  useEffect(() => {
    const init = async () => {
      if (!isExternalPopup) return;
      try {
        // check if there's a request in session
        const data = await chrome.storage.session.get('hwRequestPending');
        if (data.hwRequestPending && data.hwRequestPending.payload) {
          const response = await processHwSigningRequest(
            data.hwRequestPending as HWSigningRequest,
          );
          if (response) {
            bgMessenger.send('hwResponse', response);
            chrome.storage.session.remove('hwRequestPending');
          }
        }

        // TODO - Redirect to success page (see BX-678)
        // eslint-disable-next-line no-empty
      } catch (e: any) {}
    };
    init();
  });

  const processHwSigningRequest = async (data: HWSigningRequest) => {
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
  };

  bgMessenger.reply('hwRequest', async (data: HWSigningRequest) => {
    const response = await processHwSigningRequest(data);
    if (response) {
      bgMessenger.send('hwResponse', response);
    }
  });
  return null;
};
