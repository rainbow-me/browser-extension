import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WalletWipeWarningInfo from '~/entries/popup/components/WarningInfo/WalletWipeWarningInfo';

import { WipeWalletPrompt } from './walletWipePrompt';

const t = (s: string) =>
  i18n.t(s, { scope: 'settings.privacy_and_security.wallets_and_keys' });

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'red',
    },
    copy: `${t('wipe_wallets.warning_one')}`,
  },
  {
    icon: {
      symbol: 'info.circle.fill',
      color: 'blue',
    },
    copy: `${t('wipe_wallets.warning_two')}`,
  },
  {
    icon: {
      symbol: 'checkmark',
      color: 'green',
    },
    copy: `${t('wipe_wallets.warning_three')}`,
    link: {
      hasLink: true,
      href: 'https://rainbow.me/support/extension/backing-up-your-wallets',
    },
  },
  {
    icon: {
      symbol: 'dollarsign.square',
      color: 'yellow',
    },
    copy: `${t('wipe_wallets.warning_four')}`,
  },
];

export function WipeWalletWarning() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <WipeWalletPrompt show={showPopup} onClose={() => setShowPopup(false)} />
      <WalletWipeWarningInfo
        testId={'wipe-wallets'}
        iconAndCopyList={iconAndCopyList}
        onProceed={() => setShowPopup(true)}
      />
    </>
  );
}
