import React, { useEffect, useState } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';

import { AppConnectionNudgeBanner } from './AppConnectionNudgeBanner';
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
    addressInAppHasInteractedWithNudgeSheet,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  } = useAppConnectionWalletSwitcherStore();

  useEffect(() => {
    setTimeout(() => {
      // if there's another active address
      if (
        !!activeSession?.address &&
        !isLowerCaseMatch(activeSession?.address, currentAddress)
      ) {
        // if nudgeSheet is enabled and the nudgeSheet has not appeared on that dapp
        if (
          nudgeSheetEnabled &&
          !appHasInteractedWithNudgeSheet({ host: appMetadata.appHost })
        ) {
          setShowNudgeSheet(true);
          setAddressInAppHasInteractedWithNudgeSheet({
            address: currentAddress,
            host: appMetadata.appHost,
          });
          setAppHasInteractedWithNudgeSheet({ host: appMetadata.appHost });
          // else if the address has not interacted with the nudgeSheet
        } else if (
          !addressInAppHasInteractedWithNudgeSheet({
            address: currentAddress,
            host: appMetadata.appHost,
          })
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
    addressInAppHasInteractedWithNudgeSheet,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  ]);

  return (
    <>
      <AppConnectionNudgeBanner show={showNudgeBanner} />
      <AppConnectionNudgeSheet
        show={showNudgeSheet}
        setShow={setShowNudgeSheet}
      />
    </>
  );
};
