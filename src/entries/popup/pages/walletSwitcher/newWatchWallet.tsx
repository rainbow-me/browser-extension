import React, { useCallback } from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';

import { NAVBAR_HEIGHT } from '../../components/Navbar/Navbar';
import { WatchWallet } from '../../components/WatchWallet/WatchWallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';

const NewWatchWallet = () => {
  const navigate = useRainbowNavigate();

  const onFinishImporting = useCallback(async () => {
    navigate(-3);
  }, [navigate]);

  return (
    <Box
      background="surfaceSecondary"
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingHorizontal="20px"
      style={{
        height: POPUP_DIMENSIONS.height - NAVBAR_HEIGHT,
      }}
    >
      <WatchWallet onFinishImporting={onFinishImporting} />
    </Box>
  );
};

export { NewWatchWallet };
