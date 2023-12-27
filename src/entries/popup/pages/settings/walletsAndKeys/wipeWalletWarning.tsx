import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Address, useAccount } from 'wagmi';

// import { i18n } from '~/core/languages';
import { useCurrentAddressStore } from '~/core/state';
import { IconAndCopyItem } from '~/entries/popup/components/IconAndCopyList.tsx/IconAndCopyList';
import WarningInfo from '~/entries/popup/components/WarningInfo/WarningInfo';
import { ROUTES } from '~/entries/popup/urls';

import * as wallet from '../../../handlers/wallet';
import { ConfirmPasswordPrompt } from '../privacy/confirmPasswordPrompt';

const iconAndCopyList: IconAndCopyItem[] = [
  {
    icon: {
      symbol: 'exclamationmark.triangle',
      color: 'orange',
    },
    copy: 'this cannot be undone',
  },
  {
    icon: {
      symbol: 'eye.slash.fill',
      color: 'pink',
    },
    copy: "don't do this please ! !",
  },
  {
    icon: {
      symbol: 'lock.open.fill',
      color: 'red',
    },
    copy: "unless you're sure :)",
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
      <WarningInfo
        testId={'wipe-wallets'}
        iconAndCopyList={iconAndCopyList}
        onProceed={openPasswordPrompt}
        proceedButtonLabel={'WIPE WALLET'}
        proceedButtonSymbol="trash"
      />
    </>
  );
}
