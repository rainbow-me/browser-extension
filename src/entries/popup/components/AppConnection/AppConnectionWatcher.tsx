import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { useShowWalletBackupReminderStore } from '~/core/state/walletBackUps';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
import { useHomePromptQueue } from '../../hooks/useHomePromptsQueue';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import usePrevious from '../../hooks/usePrevious';
import { ROUTES } from '../../urls';
import { appConnectionSwitchWalletsPromptIsActive } from '../../utils/activeElement';
import { triggerToast } from '../Toast/Toast';

import { AppConnectionNudgeBanner } from './AppConnectionNudgeBanner';
import { AppConnectionNudgeSheet } from './AppConnectionNudgeSheet';

export const AppConnectionWatcher = () => {
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const { appHost, appName, appHostName } = useAppMetadata({ url });
  const location = useLocation();
  const { addSession, activeSession } = useAppSession({
    host: appHost,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideNudgeBannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showNudgeSheet, setShowNudgeSheet] = useState<boolean>(false);
  const [showNudgeBanner, setShowNudgeBanner] = useState<boolean>(false);

  const [accountChangeHappened, setAccountChangeHappened] = useState(false);
  const prevLocationPathname = usePrevious(location.pathname);
  const prevCurrentAddress = usePrevious(currentAddress);
  const { show: showWalletBackupReminder } = useShowWalletBackupReminderStore();
  const { nextInQueue } = useHomePromptQueue();

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

  const differentActiveSession =
    !!activeSession?.address &&
    !isLowerCaseMatch(activeSession?.address, currentAddress);

  const firstLoad =
    prevLocationPathname === '/' || prevLocationPathname === ROUTES.UNLOCK;

  const triggerCheck = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      // if there's another active address
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
        hideNudgeBannerTimeoutRef.current = setTimeout(() => {
          setShowNudgeBanner(false);
        }, 3000);
      }
    }, 1000);
  }, [
    addressInAppHasInteractedWithNudgeSheet,
    appHasInteractedWithNudgeSheet,
    appHost,
    currentAddress,
    nudgeSheetEnabled,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  ]);

  const hide = useCallback(() => {
    setShowNudgeSheet(false);
    setShowNudgeBanner(false);
    hideNudgeBannerTimeoutRef.current &&
      clearTimeout(hideNudgeBannerTimeoutRef.current);
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!isLowerCaseMatch(currentAddress, prevCurrentAddress)) {
      setAccountChangeHappened(true);
      hide();
    }
  }, [currentAddress, hide, prevCurrentAddress]);

  useEffect(() => {
    if (location.pathname !== ROUTES.HOME) {
      hide();
    }
  }, [hide, location.pathname]);

  useEffect(() => {
    if (
      location.pathname === ROUTES.HOME &&
      (firstLoad || accountChangeHappened) &&
      differentActiveSession &&
      !appConnectionSwitchWalletsPromptIsActive() &&
      nextInQueue === 'app-connection'
    ) {
      setAccountChangeHappened(false);
      hide();
      triggerCheck();
    }
  }, [
    accountChangeHappened,
    currentAddress,
    differentActiveSession,
    firstLoad,
    hide,
    location.pathname,
    nextInQueue,
    prevCurrentAddress,
    showWalletBackupReminder,
    triggerCheck,
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
