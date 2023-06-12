import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Box } from '~/design-system';
import { SeedVerifyQuiz } from '~/entries/popup/components/SeedVerifyQuiz/SeedVerifyQuiz';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhraseVerify() {
  const navigate = useRainbowNavigate();
  const ogNavigate = useNavigate();
  const { state } = useLocation();

  const goBackToChooseGroup = useCallback(async () => {
    await chrome.storage.session.set({
      walletToAdd: state?.wallet?.accounts?.[0],
    });
    ogNavigate(-3);
  }, [ogNavigate, state?.wallet?.accounts]);

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
