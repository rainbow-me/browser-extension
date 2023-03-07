import React, { useCallback } from 'react';

import { initializeMessenger } from '~/core/messengers';
import { useNotificationWindowStore } from '~/core/state/notificationWindow';
import { usePendingRequestStore } from '~/core/state/requests';

import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

import { RequestAccounts } from './RequestAccounts';
import { SendTransaction } from './SendTransaction';
import { SignMessage } from './SignMessage';

const backgroundMessenger = initializeMessenger({ connect: 'background' });

export const ApproveAppRequest = () => {
  const { pendingRequests, removePendingRequest } = usePendingRequestStore();
  const { notificationWindow } = useNotificationWindowStore();
  const pendingRequest = pendingRequests?.[0];
  const navigate = useRainbowNavigate();

  const handleRequestAction = useCallback(() => {
    removePendingRequest(pendingRequest?.id);
    if (pendingRequests.length <= 1 && notificationWindow?.id) {
      setTimeout(() => {
        notificationWindow?.id && chrome.windows.remove(notificationWindow?.id);
        console.log('navigated to home');
        navigate(ROUTES.HOME);
      }, 50);
    }
  }, [
    removePendingRequest,
    pendingRequest?.id,
    pendingRequests.length,
    notificationWindow?.id,
    navigate,
  ]);

  const approveRequest = useCallback(
    async (payload?: unknown) => {
      backgroundMessenger.send(`message:${pendingRequest?.id}`, payload);
      handleRequestAction();
    },
    [handleRequestAction, pendingRequest?.id],
  );

  const rejectRequest = useCallback(() => {
    backgroundMessenger.send(`message:${pendingRequest?.id}`, null);
    handleRequestAction();
  }, [handleRequestAction, pendingRequest?.id]);

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
      return null;
  }
};
