/* eslint-disable no-await-in-loop */
import React, { useCallback } from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { WatchWallet as WatchWalletStep } from '../../components/WatchWallet/WatchWallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function WatchWallet() {
  const navigate = useRainbowNavigate();

  const onFinishImporting = useCallback(async () => {
    navigate(ROUTES.CREATE_PASSWORD, { state: { backTo: ROUTES.WELCOME } });
  }, [navigate]);

  return (
    <FullScreenContainer>
      <WatchWalletStep onboarding onFinishImporting={onFinishImporting} />
    </FullScreenContainer>
  );
}
