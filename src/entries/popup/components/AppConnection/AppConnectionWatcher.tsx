import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { Box } from '~/design-system';

import { useActiveTab } from '../../hooks/useActiveTab';
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
  const { data: dappMetadata } = useDappMetadata({ url });
  const location = useLocation();
  const { addSession, activeSession } = useAppSession({
    host: dappMetadata?.appHost || '',
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerHoverRef = useRef<boolean>(false);
  const shouldAnimateOut = useRef<boolean>(false);

  const [showNudgeSheet, setShowNudgeSheet] = useState<boolean>(false);
  const [showNudgeBanner, setShowNudgeBanner] = useState<boolean>(false);

  const [accountChangeHappened, setAccountChangeHappened] = useState(false);
  const prevLocationPathname = usePrevious(location.pathname);
  const prevCurrentAddress = usePrevious(currentAddress);
  const { nextInQueue } = useHomePromptQueue();

  const connect = useCallback(() => {
    dappMetadata?.appHost &&
      addSession({
        host: dappMetadata?.appHost,
        address: currentAddress,
        chainId: activeSession?.chainId || ChainId.mainnet,
        url,
      });
    if (showNudgeBanner) {
      shouldAnimateOut.current = true;
      setShowNudgeBanner(false);
    }
    if (showNudgeSheet) setShowNudgeSheet(false);
    triggerToast({
      title: i18n.t('app_connection_switcher.banner.app_connected', {
        appName: dappMetadata?.appName || dappMetadata?.appHostName,
      }),
      description: ChainNameDisplay[activeSession?.chainId || ChainId.mainnet],
    });
  }, [
    activeSession?.chainId,
    addSession,
    currentAddress,
    dappMetadata?.appHost,
    dappMetadata?.appHostName,
    dappMetadata?.appName,
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
      timeoutRef.current = setTimeout(handleBannerTimeout, 1000);
    } else {
      shouldAnimateOut.current = true;
      setShowNudgeBanner(false);
    }
  }, []);

  const checkAndDisplayBanner = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (
      nudgeSheetEnabled &&
      !appHasInteractedWithNudgeSheet({ host: dappMetadata?.appHost })
    ) {
      shouldAnimateOut.current = true;
      setShowNudgeSheet(true);
      if (dappMetadata?.appHost) {
        setAddressInAppHasInteractedWithNudgeSheet({
          address: currentAddress,
          host: dappMetadata?.appHost,
        });
        setAppHasInteractedWithNudgeSheet({ host: dappMetadata?.appHost });
      }
      return true;
    } else if (
      !addressInAppHasInteractedWithNudgeSheet({
        address: currentAddress,
        host: dappMetadata?.appHost,
      })
    ) {
      shouldAnimateOut.current = true;
      setShowNudgeBanner(true);
      timeoutRef.current = setTimeout(handleBannerTimeout, 4000);
      return true;
    }
    shouldAnimateOut.current = false;
    return false;
  }, [
    addressInAppHasInteractedWithNudgeSheet,
    appHasInteractedWithNudgeSheet,
    currentAddress,
    dappMetadata?.appHost,
    handleBannerTimeout,
    nudgeSheetEnabled,
    setAddressInAppHasInteractedWithNudgeSheet,
    setAppHasInteractedWithNudgeSheet,
  ]);

  const hide = useCallback(() => {
    setShowNudgeSheet(false);
    setShowNudgeBanner(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useLayoutEffect(() => {
    if (
      !!prevCurrentAddress &&
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
      !appConnectionSwitchWalletsPromptIsActive() &&
      nextInQueue === 'app-connection'
    ) {
      setAccountChangeHappened(false);
      checkAndDisplayBanner();
    }
  }, [
    accountChangeHappened,
    differentActiveSession,
    firstLoad,
    location.pathname,
    nextInQueue,
    prevCurrentAddress,
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
