import React from 'react';
import { useLocation } from 'react-router-dom';

import { Box } from '~/design-system';
import { SeedVerifyQuiz } from '~/entries/popup/components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhraseVerify() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();

  return (
    <Box padding="20px">
      <SeedVerifyQuiz
        address={state?.wallet?.accounts?.[0]}
        onQuizValidated={() =>
          navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS)
        }
        handleSkip={() =>
          navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS)
        }
      />
    </Box>
  );
}
