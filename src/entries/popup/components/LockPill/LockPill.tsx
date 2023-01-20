import React from 'react';

import { Box, Inline, Symbol, Text } from '~/design-system';

import * as wallet from '../../handlers/wallet';

export default function LockPill() {
  const handleLock = async () => {
    await wallet.lock();
  };

  return (
    <Box paddingRight="4px">
      <Box
        onClick={handleLock}
        borderColor="buttonStroke"
        background="surfaceSecondaryElevated"
        borderWidth="1px"
        borderRadius="round"
        paddingHorizontal="12px"
        paddingVertical="7px"
        alignItems="center"
        justifyContent="center"
        id="wallet-lock-button"
      >
        <Inline space="6px" alignVertical="center">
          <Symbol symbol="lock.fill" size={13} weight="medium" />
          <Text size="14pt" weight="medium" color="label">
            Lock
          </Text>
        </Inline>
      </Box>
    </Box>
  );
}
