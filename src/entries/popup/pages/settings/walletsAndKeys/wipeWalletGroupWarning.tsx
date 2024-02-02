import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { goToNewTab } from '~/core/utils/tabs';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WalletGroupWipeWarningInfo from '~/entries/popup/components/WarningInfo/walletGroupWipeWarningInfo';

import { WipeWalletGroupPrompt } from './walletGroupWipePrompt';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: `${t('wipe_wallet_group.warning_one')}`,
  },
  {
    icon: {
      symbol: 'dollarsign.square',
      color: 'yellow',
    },
    copy: `${t('wipe_wallet_group.warning_two')}`,
  },
  {
    icon: {
      symbol: 'checkmark.shield.fill',
      color: 'green',
    },
    copy: `${t('wipe_wallet_group.warning_three')}`,
    onClickLink: () =>
      goToNewTab({
        url: 'https://rainbow.me/support/extension/backing-up-your-wallets',
      }),
  },
];

export function WipeWalletGroupWarning() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <WipeWalletGroupPrompt
        show={showPopup}
        onClose={() => setShowPopup(false)}
      />
      <WalletGroupWipeWarningInfo
        testId={'wipe-wallet-group'}
        iconAndCopyList={iconAndCopyList}
        onProceed={() => setShowPopup(true)}
      />
    </>
  );
}
