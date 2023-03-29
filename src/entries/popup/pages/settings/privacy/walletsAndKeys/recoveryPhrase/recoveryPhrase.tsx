import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import SeedPhraseTable from '~/entries/popup/components/SeedPhraseTable/SeedPhraseTable';
import ViewSecret from '~/entries/popup/components/ViewSecret/ViewSecret';
import { exportWallet } from '~/entries/popup/handlers/wallet';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { useToast } from '~/entries/popup/hooks/useToast';
import { ROUTES } from '~/entries/popup/urls';

export function RecoveryPhrase() {
  const { state } = useLocation();
  const navigate = useRainbowNavigate();
  const { triggerToast } = useToast();

  const [seed, setSeed] = useState('');

  const handleSavedTheseWords = useCallback(
    () => navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS),
    [navigate],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(seed as string);
    triggerToast({
      title: i18n.t(
        'settings.privacy_and_security.wallets_and_keys.recovery_phrase.phrase_copied',
      ),
    });
  }, [seed, triggerToast]);

  useEffect(() => {
    const fetchRecoveryPhrase = async () => {
      const recoveryPhrase = await exportWallet(
        state?.wallet?.accounts?.[0],
        state?.password,
      );
      setSeed(recoveryPhrase);
    };
    fetchRecoveryPhrase();
  }, [state]);

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
      onConfirm={handleSavedTheseWords}
      onCopy={handleCopy}
      secret={<SeedPhraseTable seed={seed} />}
    />
  );
}
