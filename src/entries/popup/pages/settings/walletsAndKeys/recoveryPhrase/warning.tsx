import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WarningInfo from '~/entries/popup/components/WarningInfo/WarningInfo';
import { ROUTES } from '~/entries/popup/urls';

import { ConfirmPasswordPrompt } from '../../privacy/confirmPasswordPrompt';

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
  const { state } = useLocation();
  const [showEnterPassword, setShowEnterPassword] = useState(false);

  const openPasswordPrompt = useCallback(() => setShowEnterPassword(true), []);

  const closePasswordPrompt = useCallback(
    () => setShowEnterPassword(false),
    [],
  );

  return (
    <>
      <ConfirmPasswordPrompt
        show={showEnterPassword}
        onClose={closePasswordPrompt}
        redirect={
          ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__RECOVERY_PHRASE
        }
        extraState={{ ...state }}
      />
      <WarningInfo
        testId={'show-phrase'}
        iconAndCopyList={iconAndCopyList}
        onProceed={openPasswordPrompt}
        proceedButtonLabel={i18n.t(
          'settings.privacy_and_security.wallets_and_keys.recovery_phrase.show',
        )}
        proceedButtonSymbol="doc.plaintext.fill"
      />
    </>
  );
}
