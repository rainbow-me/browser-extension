import React, { useCallback, useState } from 'react';
import { rpcHub } from '~/core/rpc-hub';
import { Box, Text } from '~/design-system';

export function ApproveMessage() {
  const [message, setMessage] = useState<{ event: string } | null>(null);

  rpcHub.on('unapprovedMessage', (message) => {
    console.log('POP UP unapprovedMessage', message);
    setMessage(message);
  });

  const approveRequest = useCallback(() => {
    rpcHub.emit('unapprovedMessage::approved', message);
    setMessage(null);
  }, [message]);

  const rejectRequest = useCallback(() => {
    rpcHub.emit('unapprovedMessage::rejected', message);
    setMessage(null);
  }, [message]);

  if (!message) return null;

  return (
    <>
      <Box padding="16px" style={{ borderRadius: 999 }}>
        <Text color="labelSecondary" size="15pt" weight="bold">
          RPC METHOD: {message?.event}
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
