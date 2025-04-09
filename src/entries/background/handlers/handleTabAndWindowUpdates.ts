import { initializeMessenger } from '~/core/messengers';
import {
  useIsDefaultWalletStore,
  useNotificationWindowStore,
  usePendingRequestStore,
} from '~/core/state';

const bridgeMessenger = initializeMessenger({ connect: 'inpage' });

export const handleTabAndWindowUpdates = () => {
  // When a tab is removed, check if that was the last tab for that host
  // if that's the case then we need to remove the pending requests
  const clearPendingRequestsOnUpdate = (tabId: number) => {
    const { pendingRequests, removePendingRequest } =
      usePendingRequestStore.getState();
    pendingRequests.forEach((request) => {
      if (request.meta?.sender?.tab?.id === tabId) {
        bridgeMessenger.send(`message:${request?.id}`, null);
        removePendingRequest(request.id);
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
