import React, { useEffect, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';

import { AppConnectionBanner } from './AppConnectionBanner';
import { AppConnectionNudgeSheet } from './AppConnectionNudgeSheet';

export const AppConnectionWatcher = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const appMetadata = useAppMetadata({ url });

  const { appSession, activeSession } = useAppSession({
    host: appMetadata.appHost,
  });

  const [showNudgeSheet, setShowNudgeSheet] = useState<boolean>(false);
  const [showNudgeBanner, setShowNudgeBanner] = useState<boolean>(false);

  const {
    nudgeSheetEnabled,
    appHasInteractedWithNudgeSheet,
    addressHasInteractedWithNudgeSheet,
    setAddressHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  } = useAppConnectionWalletSwitcherStore();

  useEffect(() => {
    setTimeout(() => {
      // if there's another active address
      if (!isLowerCaseMatch(activeSession?.address, currentAddress)) {
        // if nudgeSheet is enabled and the nudgeSheet has not appeared on that dapp
        if (
          nudgeSheetEnabled &&
          !appHasInteractedWithNudgeSheet({ host: appMetadata.appHost })
        ) {
          setShowNudgeSheet(true);
          setAddressHasInteractedWithNudgeSheet({ address: currentAddress });
          setAppHasInteractedWithNudgeSheet({ host: appMetadata.appHost });
          // else if the address has not interacted with the nudgeSheet
        } else if (
          !addressHasInteractedWithNudgeSheet({ address: currentAddress })
        ) {
          setShowNudgeBanner(true);
          setTimeout(() => {
            setShowNudgeBanner(false);
          }, 3000);
        }
      }
    }, 1000);
  }, [
    appSession,
    activeSession?.address,
    currentAddress,
    nudgeSheetEnabled,
    appHasInteractedWithNudgeSheet,
    appMetadata.appHost,
    addressHasInteractedWithNudgeSheet,
    setAddressHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  ]);

  return (
    <>
      <AppConnectionBanner show={showNudgeBanner} />
      <AppConnectionNudgeSheet
        show={showNudgeSheet}
        setShow={setShowNudgeSheet}
      />
    </>
  );
};
