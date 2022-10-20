import React, { useCallback, useState } from 'react';
import { bridgeMessenger } from '~/core/messengers';
import { backgroundStore } from '~/core/state';
import { PendingRequest } from '~/core/state/slices/pendingRequestsSlice';
import { backgroundStoreTransport } from '~/core/transports';
import { Box, Text } from '~/design-system';

export function ApproveMessage() {
  const [pendingRequest, setPendingRequests] = useState<PendingRequest | null>(
    backgroundStore.getState().pendingRequests,
  );
  backgroundStoreTransport.reply(async (state) => {
    setPendingRequests(state.pendingRequests);
  });

  const approveRequest = useCallback(() => {
    bridgeMessenger.send(`message:${pendingRequest?.id}`, true);
  }, [pendingRequest]);

  const rejectRequest = useCallback(() => {
    bridgeMessenger.send(`message:${pendingRequest?.id}`, false);
  }, [pendingRequest]);

  if (!pendingRequest) return null;

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="15pt" weight="bold">
          RPC METHOD: {pendingRequest?.method} +{' '}
          {JSON.stringify(pendingRequest)}
        </Text>
      </Box>
      <Box
        as="button"
        id="injection-button"
        background="surfaceSecondary"
        onClick={approveRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          ACCEPT
        </Text>
      </Box>
      <Box
        as="button"
        id="injection-button"
        background="surfaceSecondary"
        onClick={rejectRequest}
        padding="16px"
        style={{ borderRadius: 999 }}
      >
        <Text color="labelSecondary" size="15pt" weight="bold">
          DECLINE
        </Text>
      </Box>
    </>
  );
}
