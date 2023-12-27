import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { SessionStorage } from '~/core/storage';
import { Box } from '~/design-system';
import { SeedVerifyQuiz } from '~/entries/popup/components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhraseVerify() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();

  const goBackToChooseGroup = useCallback(async () => {
    await SessionStorage.set('walletToAdd', state?.wallet?.accounts?.[0]);
    navigate(-3);
  }, [navigate, state?.wallet?.accounts]);

  return (
    <Box padding="20px">
      <SeedVerifyQuiz
        address={state?.wallet?.accounts?.[0]}
        onQuizValidated={() =>
          state.fromChooseGroup
            ? goBackToChooseGroup()
            : navigate(
                ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS,
              )
        }
        handleSkip={() =>
          state.fromChooseGroup
            ? goBackToChooseGroup()
            : navigate(
                ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS,
              )
        }
      />
    </Box>
  );
}
