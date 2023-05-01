import React from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { SeedVerifyQuiz } from '~/entries/popup/components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhraseVerify() {
  const navigate = useRainbowNavigate();
  const { currentAddress } = useCurrentAddressStore();

  return (
    <SeedVerifyQuiz
      address={currentAddress}
      onQuizValidated={() => navigate(ROUTES.CREATE_PASSWORD)}
      handleSkip={() => navigate(ROUTES.CREATE_PASSWORD)}
    />
  );
}
