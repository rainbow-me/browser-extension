import React from 'react';

import { useCurrentAddressStore } from '~/core/state';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { SeedVerifyQuiz } from '../../components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function SeedVerify() {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();

  return (
    <FullScreenContainer>
      <SeedVerifyQuiz
        address={currentAddress}
        onQuizValidated={() => navigate(ROUTES.CREATE_PASSWORD)}
        handleSkip={() => navigate(ROUTES.CREATE_PASSWORD)}
      />
    </FullScreenContainer>
  );
}
