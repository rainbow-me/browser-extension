import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WarningInfo from '~/entries/popup/components/WarningInfo/WarningInfo';
import { ROUTES } from '~/entries/popup/urls';

import { ConfirmPasswordPrompt } from '../../confirmPasswordPrompt';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.private_key.warning_1',
    ),
  },
  {
    icon: {
      symbol: 'eye.slash.fill',
      color: 'pink',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.private_key.warning_2',
    ),
  },
  {
    icon: {
      symbol: 'lock.open.fill',
      color: 'red',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.private_key.warning_3',
    ),
  },
  {
    icon: {
      symbol: 'lifepreserver',
      color: 'blue',
    },
    copy: i18n.t(
      'settings.privacy_and_security.wallets_and_keys.private_key.warning_4',
    ),
  },
];
export function PrivateKeyWarning() {
  const { state } = useLocation();

  const [showEnterPassword, setShowEnterPassword] = useState(false);
  const [confirmPasswordRedirect, setConfirmPasswordRedirect] = useState('');
  const openPasswordPrompt = () => {
    setShowEnterPassword(true);
  };
  const closePasswordPrompt = () => {
    setShowEnterPassword(false);
  };

  const handleShowPrivkeyClick = useCallback(async () => {
    openPasswordPrompt();
    setConfirmPasswordRedirect(
      ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY,
    );
  }, []);

  return (
    <>
      <ConfirmPasswordPrompt
        show={showEnterPassword}
        onClose={closePasswordPrompt}
        redirect={confirmPasswordRedirect}
        extraState={{ account: state?.account }}
      />
      <WarningInfo
        onProceed={handleShowPrivkeyClick}
        iconAndCopyList={iconAndCopyList}
        proceedButtonLabel={i18n.t(
          'settings.privacy_and_security.wallets_and_keys.private_key.show',
        )}
        proceedButtonSymbol="key.fill"
      />
    </>
  );
}
