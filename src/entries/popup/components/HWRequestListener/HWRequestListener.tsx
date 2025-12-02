/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';
import { Hex } from 'viem';

import { initializeMessenger } from '~/core/messengers';
import { HWSigningRequest, HWSigningResponse } from '~/core/types/hw';

import {
  personalSign,
  signTransactionFromHW,
  signTypedData,
} from '../../handlers/wallet';

const processHwSigningRequest = async (
  data: HWSigningRequest,
): Promise<HWSigningResponse> => {
  try {
    let response: Hex | undefined;
    switch (data.action) {
      case 'signTransaction':
        response = await signTransactionFromHW(data.payload, data.vendor);
        break;
      case 'signMessage':
        response = await personalSign(
          data.payload.message,
          data.payload.address,
        );
        break;
      case 'signTypedData':
        response = await signTypedData(
          data.payload.message,
          data.payload.address,
        );
        break;
    }
    if (!response) {
      return { error: 'No response from hardware wallet' };
    }
    return response;
  } catch (e: any) {
    return { error: e?.name || e };
  }
};

const bgMessenger = initializeMessenger({ connect: 'background' });

export const HWRequestListener = () => {
  useEffect(() => {
    const removeListener = bgMessenger.reply<
      HWSigningRequest,
      HWSigningResponse
    >('hwRequest', async (data) => {
      return await processHwSigningRequest(data);
    });
    return () => {
      removeListener();
    };
  }, []);

  return null;
};
