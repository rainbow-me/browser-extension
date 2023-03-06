import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import SeedPhraseTable from '~/entries/popup/components/SeedPhraseTable/SeedPhaseTable';
import ViewSecret from '~/entries/popup/components/ViewSecret/ViewSecret';
import { exportWallet } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhrase() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();

  const [seed, setSeed] = useState('');

  useEffect(() => {
    const fetchRecoveryPhrase = async () => {
      const { settingsWallet } = await chrome.storage.session.get([
        'settingsWallet',
      ]);
      const recoveryPhrase = await exportWallet(
        settingsWallet?.accounts?.[0],
        state?.password,
      );
      setSeed(recoveryPhrase);
    };
    fetchRecoveryPhrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavedTheseWords = useCallback(async () => {
    navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS);
  }, [navigate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
  }, [seed]);

  return (
    <ViewSecret
      titleSymbol="key.fill"
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
      confirmButtonTopSpacing={80}
      onConfirm={handleSavedTheseWords}
      onCopy={handleCopy}
      secret={<SeedPhraseTable seed={seed} />}
    />
  );
}
