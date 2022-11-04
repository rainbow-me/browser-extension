import React, { useCallback } from 'react';
import { Address } from 'wagmi';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';
import { Box, Text } from '~/design-system';

import { ApproveRequestAccounts } from './ApproveRequestAccounts';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export function ApproveMessage() {
  const { pendingRequests, removePendingRequest } = usePendingRequestStore();
  const { window } = useNotificationWindowStore();
  const pendingRequest = pendingRequests[0];

  const approveRequest = useCallback(
    (payload: { address: Address; chainId: number }) => {
      backgroundMessenger.send(`message:${pendingRequest?.id}`, payload);
      removePendingRequest(pendingRequest?.id);
      // Wait until the message propagates to the background provider.
      setTimeout(() => {
        if (window?.id) chrome.windows.remove(window.id);
      }, 50);
    },
    [pendingRequest?.id, window?.id, removePendingRequest],
  );

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, false);
    removePendingRequest(pendingRequest?.id);
    // Wait until the message propagates to the background provider.
    setTimeout(() => {
      if (window?.id) chrome.windows.remove(window.id);
    }, 50);
  }, [pendingRequest?.id, window?.id, removePendingRequest]);

  if (pendingRequest.method === 'eth_requestAccounts') {
    return (
      <ApproveRequestAccounts
        approveRequest={approveRequest}
        rejectRequest={rejectRequest}
        request={pendingRequest}
      />
    );
  }

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
