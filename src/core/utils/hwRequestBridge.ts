/**
 * Hardware Wallet Request Bridge
 *
 * Handles communication between background and popup for HW signing requests.
 * Uses chrome.runtime.sendMessage for communication.
 */

import { Address, Hex } from 'viem';

import type {
  HWSigningAction,
  HWSigningRequest,
  HWSigningResponse,
} from '~/core/types/hw';
import { TransactionRequest } from '~/core/types/transactions';

import { PersonalSignMessage, TypedDataMessage } from '../types/messageSigning';

type HardwareWalletVendor = 'Ledger' | 'Trezor';

type HWPayload =
  | TransactionRequest
  | { message: PersonalSignMessage; address: Address }
  | { message: TypedDataMessage; address: Address };

const HW_REQUEST_CHANNEL = 'hw_request';

/**
 * Send a hardware wallet signing request from background to popup
 */
export async function sendHWRequestToPopup(
  action: HWSigningAction,
  vendor: HardwareWalletVendor,
  payload: HWPayload,
): Promise<Hex> {
  return new Promise((resolve, reject) => {
    const request = {
      action,
      vendor,
      payload,
    } as HWSigningRequest;

    chrome.runtime.sendMessage(
      { channel: HW_REQUEST_CHANNEL, payload: request },
      (response: HWSigningResponse | undefined) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (typeof response === 'string') {
          resolve(response);
        } else if (response && 'error' in response) {
          reject(new Error(response.error));
        } else if (response && 'signature' in response) {
          resolve(response.signature);
        } else {
          reject(new Error('Invalid HW response'));
        }
      },
    );
  });
}

/**
 * Listen for HW requests in the popup
 * Returns a cleanup function
 */
export function listenForHWRequests(
  handler: (request: HWSigningRequest) => Promise<HWSigningResponse>,
): () => void {
  const listener = (
    message: { channel: string; payload: HWSigningRequest },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: HWSigningResponse) => void,
  ) => {
    if (message.channel === HW_REQUEST_CHANNEL) {
      handler(message.payload)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({ error: error.message });
        });
      return true; // Keep the message channel open for async response
    }
  };

  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}
