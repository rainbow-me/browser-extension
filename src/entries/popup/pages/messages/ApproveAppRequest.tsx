import React, { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';
import { Box, Text } from '~/design-system';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { RequestAccounts } from './RequestAccounts';
import { SendTransaction } from './SendTransaction';
import { SignMessage } from './SignMessage';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export const ApproveAppRequest = () => {
  const { pendingRequests, removePendingRequest } = usePendingRequestStore();
  const { window } = useNotificationWindowStore();
  const navigate = useRainbowNavigate();
  const pendingRequest = pendingRequests?.[0];

  const approveRequest = useCallback(
    async (payload?: unknown) => {
      backgroundMessenger.send(`message:${pendingRequest?.id}`, payload);
      setTimeout(() => {
        if (window?.id && pendingRequests.length <= 1)
          chrome.windows.remove(window?.id);
        removePendingRequest(pendingRequest?.id);
      }, 50);
      navigate(ROUTES.HOME);
    },
    [
      navigate,
      pendingRequest?.id,
      pendingRequests.length,
      removePendingRequest,
      window?.id,
    ],
  );

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, null);
    setTimeout(() => {
      if (window?.id && pendingRequests.length <= 1)
        chrome.windows.remove(window.id);
      removePendingRequest(pendingRequest?.id);
    }, 50);
    navigate(ROUTES.HOME);
  }, [
    navigate,
    pendingRequest?.id,
    pendingRequests.length,
    removePendingRequest,
    window?.id,
  ]);

  switch (pendingRequest?.method) {
    case 'eth_requestAccounts':
      return (
        <RequestAccounts
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case 'eth_sign':
    case 'personal_sign':
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4':
      return (
        <SignMessage
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    case 'eth_sendTransaction':
      return (
        <SendTransaction
          approveRequest={approveRequest}
          rejectRequest={rejectRequest}
          request={pendingRequest}
        />
      );
    default:
      return (
        <>
          <Box padding="16px" style={{ borderRadius: 999 }}>
            <Text color="labelSecondary" size="14pt" weight="bold">
              {`RPC METHOD ${String(pendingRequest?.method)} ${JSON.stringify(
                pendingRequest,
              )}`}
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
};
