import { initializeMessenger } from '~/core/messengers';
import {
  useIsDefaultWalletStore,
  useNotificationWindowStore,
  usePendingRequestStore,
} from '~/core/state';
import { getSenderHost } from '~/core/state/requests/utils';

const bridgeMessenger = initializeMessenger({ connect: 'inpage' });

export const handleTabAndWindowUpdates = () => {
  // When a tab is removed, clean up pending requests and connection resolvers
  const clearPendingRequestsOnUpdate = (tabId: number) => {
    const { pendingRequests, removePendingRequest, resolveConnectionRequests } =
      usePendingRequestStore.getState();
    pendingRequests.forEach((request) => {
      if (request.meta?.sender?.tab?.id === tabId) {
        bridgeMessenger.send(`message:${request?.id}`, null);
        removePendingRequest(request.id);

        // If this was a connection request, track the host for resolver cleanup
        if (request.method === 'eth_requestAccounts') {
          const host = getSenderHost(request);
          if (host) {
            resolveConnectionRequests(
              host,
              new Error('Tab closed before connection completed'),
              true,
            );
          }
        }
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chrome.tabs.onRemoved.addListener(function (tabId, _) {
    clearPendingRequestsOnUpdate(tabId);
  });

  chrome.tabs.onActivated.addListener(() => {
    bridgeMessenger.send('rainbow_setDefaultProvider', {
      rainbowAsDefault: useIsDefaultWalletStore.getState().isDefaultWallet,
    });
  });

  chrome.windows.onRemoved.addListener((id) => {
    const { setNotificationWindow, notificationWindows } =
      useNotificationWindowStore.getState();

    for (const [tabId, notificationWindow] of Object.entries(
      notificationWindows,
    )) {
      if (id === notificationWindow?.id) {
        // The popup has been closed
        clearPendingRequestsOnUpdate(Number(tabId));
        setNotificationWindow(tabId, undefined);
      }
    }
  });
};
