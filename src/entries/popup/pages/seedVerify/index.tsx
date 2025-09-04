import React, { useCallback } from 'react';

import { useSettingsStore } from '~/core/state/currentSettings/store';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { SeedVerifyQuiz } from '../../components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function SeedVerify() {
  const navigate = useRainbowNavigate();
  const [currentAddress] = useSettingsStore('currentAddress');
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
