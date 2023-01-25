/* eslint-disable no-await-in-loop */
import React, { useCallback } from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { WatchWallet as WatchWalletStep } from '../../components/WatchWallet/WatchWallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function WatchWallet() {
  const navigate = useRainbowNavigate();

  const onFinishImporting = useCallback(async () => {
    setTimeout(() => {
      navigate(ROUTES.CREATE_PASSWORD);
    }, 1200);
  }, [navigate]);

  return (
    <FullScreenContainer>
      <WatchWalletStep suggestions onFinishImporting={onFinishImporting} />
    </FullScreenContainer>
  );
}
