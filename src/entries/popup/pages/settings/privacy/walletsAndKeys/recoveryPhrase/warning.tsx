import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WarningInfo from '~/entries/popup/components/WarningInfo/WarningInfo';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.recovery_phrase.warning_1',
    ),
  },
  {
    icon: {
      symbol: 'eye.slash.fill',
      color: 'pink',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.recovery_phrase.warning_2',
    ),
  },
  {
    icon: {
      symbol: 'lock.open.fill',
      color: 'red',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.recovery_phrase.warning_3',
    ),
  },
  {
    icon: {
      symbol: 'lifepreserver',
      color: 'blue',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.recovery_phrase.warning_4',
    ),
  },
];

export function RecoveryPhraseWarning() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();

  const handleShowRecoveryPhraseClick = useCallback(async () => {
    navigate(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE,
      {
        state: { password: state?.password, wallet: state?.wallet },
      },
    );
  }, [navigate, state?.password, state?.wallet]);

  return (
    <WarningInfo
      iconAndCopyList={iconAndCopyList}
      onProceed={handleShowRecoveryPhraseClick}
      proceedButtonLabel={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.recovery_phrase.show',
      )}
      proceedButtonSymbol="doc.plaintext.fill"
    />
  );
}
