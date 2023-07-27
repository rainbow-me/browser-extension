/* eslint-disable no-await-in-loop */
import { useCallback } from 'react';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { WatchWallet as WatchWalletStep } from '../../components/WatchWallet/WatchWallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function WatchWallet() {
  const navigate = useRainbowNavigate();

  const onFinishImporting = useCallback(async () => {
    // workaround for a deeper issue where the keychain status
    // didn't yet updated or synced in the same tick
    setTimeout(
      () =>
        navigate(ROUTES.CREATE_PASSWORD, { state: { backTo: ROUTES.WELCOME } }),
      1,
    );
  }, [navigate]);

  return (
    <FullScreenContainer>
      <WatchWalletStep onboarding onFinishImporting={onFinishImporting} />
    </FullScreenContainer>
  );
}
