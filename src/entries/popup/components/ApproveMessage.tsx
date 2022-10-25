import React, { useCallback } from 'react';
import { extensionMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/pendingRequest';
import { Box, Text } from '~/design-system';

export function ApproveMessage() {
  const { pendingRequests } = usePendingRequestStore();
  const { window } = useNotificationWindowStore();

  const pendingRequest = pendingRequests[0];
  const approveRequest = useCallback(() => {
    extensionMessenger.send(`message:${pendingRequest?.id}`, true);
    if (window?.id) chrome.windows.remove(window.id);
  }, [pendingRequest?.id, window?.id]);

  const rejectRequest = useCallback(() => {
    extensionMessenger.send(`message:${pendingRequest?.id}`, false);
    if (window?.id) chrome.windows.remove(window.id);
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
