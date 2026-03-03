/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect } from 'react';
import { Hex } from 'viem';

import { HWSigningRequest, HWSigningResponse } from '~/core/types/hw';
import { listenForHWRequests } from '~/core/utils/hwRequestBridge';

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
    return { signature: response };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
};

export const HWRequestListener = () => {
  useEffect(() => {
    const cleanup = listenForHWRequests(processHwSigningRequest);
    return cleanup;
  }, []);

  return null;
};
