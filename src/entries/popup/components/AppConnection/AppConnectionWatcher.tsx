import React, { useCallback, useLayoutEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { Box } from '~/design-system';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppMetadata } from '../../hooks/useAppMetadata';
import { useAppSession } from '../../hooks/useAppSession';
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
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideNudgeBannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerHoverRef = useRef<boolean>(false);

  const [showNudgeSheet, setShowNudgeSheet] = useState<boolean>(false);
  const [showNudgeBanner, setShowNudgeBanner] = useState<boolean>(false);
  const shouldAnimateOut = useRef<boolean>(false);

  const [accountChangeHappened, setAccountChangeHappened] = useState(false);
  const prevLocationPathname = usePrevious(location.pathname);
  const prevCurrentAddress = usePrevious(currentAddress);

  const connect = useCallback(() => {
    addSession({
      host: appHost,
      address: currentAddress,
      chainId: activeSession?.chainId || ChainId.mainnet,
      url,
    });
    if (showNudgeBanner) {
      shouldAnimateOut.current = true;
      setShowNudgeBanner(false);
    }
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
        e.preventDefault();
        if (showNudgeBanner) setShowNudgeBanner(false);
        if (showNudgeSheet) setShowNudgeSheet(false);
      } else if (e.key === shortcuts.global.SELECT.key) {
        e.preventDefault();
        connect();
        triggerToast({
          title: i18n.t('app_connection_switcher.banner.app_connected', {
            appName: appName || appHostName,
          }),
          description:
            ChainNameDisplay[activeSession?.chainId || ChainId.mainnet],
        });
      }
    },
  });

  const differentActiveSession =
    !!activeSession?.address &&
    !isLowerCaseMatch(activeSession?.address, currentAddress);

  const firstLoad =
    prevLocationPathname === '/' || prevLocationPathname === ROUTES.UNLOCK;

  const handleBannerTimeout = useCallback(() => {
    if (bannerHoverRef.current) {
      hideNudgeBannerTimeoutRef.current = setTimeout(handleBannerTimeout, 1000);
    } else {
      shouldAnimateOut.current = true;
      setShowNudgeBanner(false);
    }
  }, []);

  const checkAndDisplayBanner = useCallback(() => {
    // Clear existing timeouts
    if (hideNudgeBannerTimeoutRef.current) {
      clearTimeout(hideNudgeBannerTimeoutRef.current);
    }

    if (
      nudgeSheetEnabled &&
      !appHasInteractedWithNudgeSheet({ host: appHost })
    ) {
      shouldAnimateOut.current = true;
      setShowNudgeSheet(true);
      setAddressInAppHasInteractedWithNudgeSheet({
        address: currentAddress,
        host: appHost,
      });
      setAppHasInteractedWithNudgeSheet({ host: appHost });
      return true;
    } else if (
      !addressInAppHasInteractedWithNudgeSheet({
        address: currentAddress,
        host: appHost,
      })
    ) {
      shouldAnimateOut.current = true;
      setShowNudgeBanner(true);
      hideNudgeBannerTimeoutRef.current = setTimeout(handleBannerTimeout, 4000);
      return true;
    }
    shouldAnimateOut.current = false;
    return false;
  }, [
    addressInAppHasInteractedWithNudgeSheet,
    appHasInteractedWithNudgeSheet,
    appHost,
    currentAddress,
    handleBannerTimeout,
    nudgeSheetEnabled,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  ]);

  const hide = useCallback(() => {
    setShowNudgeSheet(false);
    setShowNudgeBanner(false);
    if (hideNudgeBannerTimeoutRef.current) {
      clearTimeout(hideNudgeBannerTimeoutRef.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (
      !isLowerCaseMatch(currentAddress, prevCurrentAddress) &&
      (!checkAndDisplayBanner() || !differentActiveSession)
    ) {
      shouldAnimateOut.current = false;
      hide();
    }
  }, [
    currentAddress,
    hide,
    prevCurrentAddress,
    checkAndDisplayBanner,
    differentActiveSession,
  ]);

  useLayoutEffect(() => {
    if (location.pathname !== ROUTES.HOME) {
      shouldAnimateOut.current = true;
      hide();
    }
  }, [hide, location.pathname]);

  useLayoutEffect(() => {
    if (
      location.pathname === ROUTES.HOME &&
      (firstLoad || accountChangeHappened) &&
      differentActiveSession &&
      !appConnectionSwitchWalletsPromptIsActive()
    ) {
      setAccountChangeHappened(false);
      checkAndDisplayBanner();
    }
  }, [
    accountChangeHappened,
    differentActiveSession,
    firstLoad,
    location.pathname,
    checkAndDisplayBanner,
  ]);

  return (
    <>
      <Box opacity={shouldAnimateOut.current === true ? '1' : '0'}>
        <AppConnectionNudgeBanner
          show={showNudgeBanner}
          connect={connect}
          hide={hide}
          bannerHoverRef={bannerHoverRef}
        />
      </Box>
      <AppConnectionNudgeSheet
        show={showNudgeSheet}
        connect={connect}
        setShow={setShowNudgeSheet}
      />
    </>
  );
};
