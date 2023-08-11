import React, { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { triggerToast } from '../Toast/Toast';

import { AppConnectionNudgeBanner } from './AppConnectionNudgeBanner';
import { AppConnectionNudgeSheet } from './AppConnectionNudgeSheet';

export const AppConnectionWatcher = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const { appHost, appName, appHostName } = useAppMetadata({ url });

  const { addSession, appSession, activeSession } = useAppSession({
    host: appHost,
  });

  const connect = useCallback(() => {
    addSession({
      host: appHost,
      address: currentAddress,
      chainId: activeSession?.chainId || ChainId.mainnet,
      url,
    });
  }, [activeSession?.chainId, addSession, appHost, currentAddress, url]);

  const [showNudgeSheet, setShowNudgeSheet] = useState<boolean>(false);
  const [showNudgeBanner, setShowNudgeBanner] = useState<boolean>(false);

  const {
    nudgeSheetEnabled,
    appHasInteractedWithNudgeSheet,
    addressInAppHasInteractedWithNudgeSheet,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  } = useAppConnectionWalletSwitcherStore();

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (!showNudgeBanner && !showNudgeSheet) return;
      if (e.key === shortcuts.global.CLOSE.key) {
        if (showNudgeBanner) setShowNudgeBanner(false);
        if (showNudgeSheet) setShowNudgeSheet(false);
      } else if (e.key === shortcuts.global.SELECT.key) {
        connect();
        if (showNudgeBanner) setShowNudgeBanner(false);
        if (showNudgeSheet) setShowNudgeSheet(false);
        triggerToast({
          title: i18n.t('app_connection_switcher.banner.app_connected', {
            appName: appName || appHostName,
          }),
          description:
            ChainNameDisplay[activeSession?.chainId || ChainId.mainnet],
        });
      }
      e.preventDefault();
    },
  });

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
          !appHasInteractedWithNudgeSheet({ host: appHost })
        ) {
          setShowNudgeSheet(true);
          setAddressInAppHasInteractedWithNudgeSheet({
            address: currentAddress,
            host: appHost,
          });
          setAppHasInteractedWithNudgeSheet({ host: appHost });
          // else if the address has not interacted with the nudgeSheet
        } else if (
          !addressInAppHasInteractedWithNudgeSheet({
            address: currentAddress,
            host: appHost,
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
    addressInAppHasInteractedWithNudgeSheet,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
    appHost,
  ]);

  return (
    <>
      <AppConnectionNudgeBanner show={showNudgeBanner} connect={connect} />
      <AppConnectionNudgeSheet
        show={showNudgeSheet}
        connect={connect}
        setShow={setShowNudgeSheet}
      />
    </>
  );
};
