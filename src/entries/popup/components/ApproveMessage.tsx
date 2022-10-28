import React, { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';
import { Box, Text } from '~/design-system';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export function ApproveMessage() {
  const { pendingRequests } = usePendingRequestStore();
  const { window } = useNotificationWindowStore();
  const pendingRequest = pendingRequests[0];

  const approveRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, true);
    // Wait until the message propagates to the background provider.
    setTimeout(() => {
      if (window?.id) chrome.windows.remove(window.id);
    }, 50);
  }, [pendingRequest?.id, window?.id]);

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, false);
    // Wait until the message propagates to the background provider.
    setTimeout(() => {
      if (window?.id) chrome.windows.remove(window.id);
    }, 50);
  }, [pendingRequest?.id, window?.id]);

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="14pt" weight="bold">
          RPC METHOD: {pendingRequest?.method} +{' '}
          {JSON.stringify(pendingRequest)}
        </Text>
      </Box>
      <Box
        as="button"
        id="accept-button"
        background="surfaceSecondary"
        onClick={approveRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="14pt" weight="bold">
          ACCEPT
        </Text>
      </Box>
      <Box
        as="button"
        id="reject-button"
        background="surfaceSecondary"
        onClick={rejectRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="14pt" weight="bold">
          REJECT
        </Text>
      </Box>
    </>
  );
}
