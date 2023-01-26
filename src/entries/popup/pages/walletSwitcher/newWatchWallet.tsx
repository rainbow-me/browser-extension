import React, { useCallback } from 'react';

import { Box } from '~/design-system';

import { WatchWallet } from '../../components/WatchWallet/WatchWallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const NewWatchWallet = () => {
  const navigate = useRainbowNavigate();

  const onFinishImporting = useCallback(async () => {
    navigate(ROUTES.WALLET_SWITCHER);
  }, [navigate]);
  return (
    <Box
      height="full"
      paddingHorizontal="20px"
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <WatchWallet onFinishImporting={onFinishImporting} />
    </Box>
  );
};

export { NewWatchWallet };
