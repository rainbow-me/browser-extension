/**
 * Portal transport for browser extension that captures the message sender.
 * Compatible with viem-portal's message format for relay.
 * Injects chrome.runtime.MessageSender into requests for tab/url context.
 */
import type { PortalMessage, Transport } from 'viem-portal';

const PORTAL_MESSAGE_TYPE = 'rainbow-portal';

function isPortalEnvelope(
  data: unknown,
): data is { type: string; message: PortalMessage } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as { type: string }).type === PORTAL_MESSAGE_TYPE
  );
}

export type PortalMessageWithSender = PortalMessage & {
  _sender?: chrome.runtime.MessageSender;
  /** For request messages: callback to send the response back to the client */
  _sendResponse?: (response: unknown) => void;
};

/**
 * Creates a tab transport that injects the message sender into requests.
 * The host can access meta.sender from the request for tab/url context.
 */
export function createTabTransportWithSender(): Transport {
  const handlers = new Set<(message: PortalMessageWithSender) => void>();

  const listener = (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    if (!isPortalEnvelope(message)) return false;

    const msg = { ...message.message } as PortalMessageWithSender;
    if (msg.type === 'request') {
      msg._sender = sender;
      msg._sendResponse = sendResponse;
    }
    handlers.forEach((h) => h(msg));
    return true; // Keep channel open for async sendResponse
  };

  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener(listener);
  }

  return {
    send(message: PortalMessage) {
      const envelope = { type: PORTAL_MESSAGE_TYPE, message };
      chrome.runtime.sendMessage(envelope);
    },
    subscribe(handler: (message: PortalMessageWithSender) => void) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close() {
      if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(listener);
      }
      handlers.clear();
    },
  };
}
