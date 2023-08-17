import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useLocation,
  useNavigation,
  useNavigationType,
} from 'react-router-dom';

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
import usePrevious from '../../hooks/usePrevious';
import { triggerToast } from '../Toast/Toast';

import { AppConnectionNudgeBanner } from './AppConnectionNudgeBanner';
import { AppConnectionNudgeSheet } from './AppConnectionNudgeSheet';

export const AppConnectionWatcher = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const { appHost, appName, appHostName } = useAppMetadata({ url });
  const navigationType = useNavigationType();
  const prevCurrentAddress = usePrevious(currentAddress);
  const location = useLocation();
  const { addSession, appSession, activeSession } = useAppSession({
    host: appHost,
  });
  const navigation = useNavigation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showNudgeSheet, setShowNudgeSheet] = useState<boolean>(false);
  const [showNudgeBanner, setShowNudgeBanner] = useState<boolean>(false);
  const [showWalletSwitcher, setShowWalletSwitcher] = useState<boolean>(false);

  const connect = useCallback(() => {
    addSession({
      host: appHost,
      address: currentAddress,
      chainId: activeSession?.chainId || ChainId.mainnet,
      url,
    });
    if (showNudgeBanner) setShowNudgeBanner(false);
    if (showNudgeSheet) setShowNudgeSheet(false);
  }, [
    activeSession?.chainId,
    addSession,
    appHost,
    currentAddress,
    showNudgeBanner,
    showNudgeSheet,
    url,
  ]);

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
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setShowNudgeBanner(false);
    timeoutRef.current = setTimeout(() => {
      // if there's another active address
      if (
        !!activeSession?.address &&
        !isLowerCaseMatch(activeSession?.address, currentAddress) &&
        !showWalletSwitcher
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
          hideTimeoutRef.current = setTimeout(() => {
            setShowNudgeBanner(false);
          }, 3000);
        }
      }
    }, 1000);
    return () => {
      hideTimeoutRef.current && clearTimeout(hideTimeoutRef.current);
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
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
    showWalletSwitcher,
    navigationType,
    prevCurrentAddress,
    navigation,
    location,
  ]);

  return (
    <>
      <AppConnectionNudgeBanner show={showNudgeBanner} connect={connect} />
      <AppConnectionNudgeSheet
        show={showNudgeSheet}
        connect={connect}
        setShow={setShowNudgeSheet}
        showWalletSwitcher={showWalletSwitcher}
        setShowWalletSwitcher={setShowWalletSwitcher}
      />
    </>
  );
};
