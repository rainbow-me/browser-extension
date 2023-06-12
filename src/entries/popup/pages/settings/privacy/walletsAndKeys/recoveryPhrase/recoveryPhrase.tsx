import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import SeedPhraseTable from '~/entries/popup/components/SeedPhraseTable/SeedPhraseTable';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import ViewSecret from '~/entries/popup/components/ViewSecret/ViewSecret';
import { exportWallet } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhrase() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();

  const [seed, setSeed] = useState('');

  const handleSavedTheseWords = useCallback(() => {
    navigate(
      state?.showQuiz
        ? ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE_VERIFY
        : -3,
      {
        state: {
          wallet: state?.wallet,
          password: state?.password,
          fromChooseGroup: state?.fromChooseGroup,
        },
      },
    );
  }, [
    navigate,
    state?.fromChooseGroup,
    state?.password,
    state?.showQuiz,
    state?.wallet,
  ]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
    triggerToast({
      title: i18n.t(
        'settings.privacy_and_security.wallets_and_keys.recovery_phrase.phrase_copied',
      ),
    });
  }, [seed]);

  useEffect(() => {
    const fetchRecoveryPhrase = async () => {
      const recoveryPhrase = await exportWallet(
        state?.wallet?.accounts?.[0],
        state?.password,
      );
      if (recoveryPhrase) {
        setSeed(recoveryPhrase);
      }
    };
    fetchRecoveryPhrase();
  }, [state]);

  return (
    <ViewSecret
      titleSymbol="doc.plaintext"
      title={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.recovery_phrase.title',
      )}
      subtitle={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.recovery_phrase.subtitle',
      )}
      confirmButtonLabel={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.recovery_phrase.saved',
      )}
      confirmButtonSymbol="doc.plaintext"
      onConfirm={handleSavedTheseWords}
      onCopy={handleCopy}
      secret={<SeedPhraseTable seed={seed} />}
    />
  );
}
