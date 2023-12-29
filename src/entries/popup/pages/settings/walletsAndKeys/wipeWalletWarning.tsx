import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address, useAccount } from 'wagmi';

// import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WalletWipeWarningInfo from '~/entries/popup/components/WarningInfo/WalletWipeWarningInfo';
import { ROUTES } from '~/entries/popup/urls';

import * as wallet from '../../../handlers/wallet';
import { ConfirmPasswordPrompt } from '../privacy/confirmPasswordPrompt';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'red',
    },
    copy: 'Deleting your wallets from our extension is both permanent and irreversible.',
  },
  {
    icon: {
      symbol: 'info.circle.fill',
      color: 'blue',
    },
    copy: 'Make sure you have your recovery info backed up before deletion.',
  },
  {
    icon: {
      symbol: 'checkmark',
      color: 'green',
    },
    copy: 'You can always access your wallets if you have the correct recovery info.',
  },
];

export function WipeWalletWarning() {
  const { state } = useLocation();
  const [showEnterPassword, setShowEnterPassword] = useState(false);
  const { address } = useAccount();
  const { setCurrentAddress } = useCurrentAddressStore();

  const openPasswordPrompt = useCallback(() => setShowEnterPassword(true), []);

  const updateState = useCallback(async () => {
    const accounts = await wallet.getAccounts();
    if (accounts.length > 0 && !accounts.includes(address as Address)) {
      setCurrentAddress(accounts[0]);
    }
  }, [address, setCurrentAddress]);

  const closePasswordPrompt = useCallback(
    async () => setShowEnterPassword(false),
    [],
  );

  const handleWipeWallet = useCallback(async () => {
    await wallet.wipe();
    await updateState();
  }, [updateState]);

  return (
    <>
      <ConfirmPasswordPrompt
        show={showEnterPassword}
        onClose={closePasswordPrompt}
        redirect={ROUTES.WELCOME}
        extraState={{ ...state }}
        onSuccess={handleWipeWallet}
      />
      <WalletWipeWarningInfo
        testId={'wipe-wallets'}
        iconAndCopyList={iconAndCopyList}
        onProceed={openPasswordPrompt}
      />
    </>
  );
}
