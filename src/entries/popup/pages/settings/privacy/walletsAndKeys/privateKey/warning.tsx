import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WarningInfo from '~/entries/popup/components/WarningInfo/WarningInfo';
import { ROUTES } from '~/entries/popup/urls';

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
  const navigate = useNavigate();

  const handleShowPrivkeyClick = useCallback(async () => {
    navigate(ROUTES.SETTINGS__PRIVACY__WALLETS_AND_KEYS__WALLET_DETAILS__PKEY, {
      state: { password: state.password, account: state.account },
    });
  }, [navigate, state.account, state.password]);

  return (
    <WarningInfo
      onProceed={handleShowPrivkeyClick}
      iconAndCopyList={iconAndCopyList}
      proceedButtonLabel={i18n.t(
        'settings.privacy_and_security.wallets_and_keys.private_key.show',
      )}
      proceedButtonSymbol="key.fill"
    />
  );
}
