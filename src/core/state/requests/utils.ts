import type { ProviderRequestPayload } from '~/core/transports/providerRequestTransport';

export const getSenderHost = (
  request: ProviderRequestPayload,
): string | null => {
  const senderUrl = request.meta?.sender?.url;
  if (!senderUrl) return null;
  try {
    return new URL(senderUrl).hostname;
  } catch {
    return null;
  }
};

export const getTabIdString = (
  request: ProviderRequestPayload,
): string | null => {
  const tabId = request.meta?.sender?.tab?.id;
  if (typeof tabId === 'number' || typeof tabId === 'string') {
    return tabId.toString();
  }
  return null;
};
