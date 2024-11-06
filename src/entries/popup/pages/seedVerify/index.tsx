import React, { useCallback } from 'react';

import { useCurrentAddressStore } from '~/core/state';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { SeedVerifyQuiz } from '../../components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function SeedVerify() {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();
  const goToCreatePassword = useCallback(
    () =>
      navigate(ROUTES.CREATE_PASSWORD, { state: { backTo: ROUTES.WELCOME } }),
    [navigate],
  );
  return (
    <FullScreenContainer>
      <SeedVerifyQuiz
        address={currentAddress}
        onQuizValidated={goToCreatePassword}
        handleSkip={goToCreatePassword}
        entryPoint="onboarding"
      />
    </FullScreenContainer>
  );
}
