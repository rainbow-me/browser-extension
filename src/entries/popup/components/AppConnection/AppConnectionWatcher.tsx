import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDappMetadata } from '~/core/resources/metadata/dapp';
import { useCurrentAddressStore } from '~/core/state';
import { useAppConnectionWalletSwitcherStore } from '~/core/state/appConnectionWalletSwitcher/appConnectionSwitcher';
import { useNetworkStore } from '~/core/state/networks/networks';
import { ChainId } from '~/core/types/chains';
import { getDappHost } from '~/core/utils/connectedApps';
import { isLowerCaseMatch } from '~/core/utils/strings';
import { Box } from '~/design-system';

import { useActiveTab } from '../../hooks/useActiveTab';
import { useAppSession } from '../../hooks/useAppSession';
import { useAppSessions } from '../../hooks/useAppSessions';
import { useHomePromptQueue } from '../../hooks/useHomePromptsQueue';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import usePrevious from '../../hooks/usePrevious';
import { ROUTES } from '../../urls';
import { appConnectionSwitchWalletsPromptIsActive } from '../../utils/activeElement';
import { triggerToast } from '../Toast/Toast';

import { AppConnectionNudgeBanner } from './AppConnectionNudgeBanner';
import { AppConnectionNudgeSheet } from './AppConnectionNudgeSheet';

export const AppConnectionWatcher = () => {
  const chainsLabel = useNetworkStore((state) => state.getChainsLabel());
  const { currentAddress } = useCurrentAddressStore();
  const { url } = useActiveTab();
  const { data: dappMetadata } = useDappMetadata({ url });
  const location = useLocation();

  // Get host from metadata or derive from URL as fallback
  const appHost = useMemo(() => {
    return dappMetadata?.appHost || (url ? getDappHost(url) : '');
  }, [dappMetadata?.appHost, url]);

  const { activeSession } = useAppSession({
    host: appHost,
  });
  const { addSession } = useAppSessions();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerHoverRef = useRef<boolean>(false);
  const [bannerHiddenByTimeout, setBannerHiddenByTimeout] = useState(false);

  const prevLocationPathname = usePrevious(location.pathname);
  const prevCurrentAddress = usePrevious(currentAddress);
  const { nextInQueue } = useHomePromptQueue();

  const nudgeSheetEnabled = useAppConnectionWalletSwitcherStore(
    (state) => state.nudgeSheetEnabled,
  );
  const appHasInteractedWithNudgeSheet = useAppConnectionWalletSwitcherStore(
    (state) => state.appHasInteractedWithNudgeSheet,
  );
  const setAppHasInteractedWithNudgeSheet = useAppConnectionWalletSwitcherStore(
    (state) => state.setAppHasInteractedWithNudgeSheet,
  );

  // Compute derived state deterministically
  const differentActiveSession = useMemo(
    () =>
      !!activeSession?.address &&
      !isLowerCaseMatch(activeSession?.address, currentAddress),
    [activeSession?.address, currentAddress],
  );

  const isOnHomePage = useMemo(
    () => location.pathname === ROUTES.HOME,
    [location.pathname],
  );

  const isFirstLoad = useMemo(
    () =>
      prevLocationPathname === '/' || prevLocationPathname === ROUTES.UNLOCK,
    [prevLocationPathname],
  );

  const addressChanged = useMemo(
    () =>
      !!prevCurrentAddress &&
      !isLowerCaseMatch(currentAddress, prevCurrentAddress),
    [currentAddress, prevCurrentAddress],
  );

  const hasValidUrl = useMemo(() => url !== '', [url]);

  const shouldShowNudge = useMemo(() => {
    // Don't show if not on home page
    if (!isOnHomePage) return { sheet: false, banner: false };

    // Don't show if no valid URL
    if (!hasValidUrl) return { sheet: false, banner: false };

    // Don't show if wallet switcher prompt is active
    if (appConnectionSwitchWalletsPromptIsActive()) {
      return { sheet: false, banner: false };
    }

    // Don't show if not the next prompt in queue
    if (nextInQueue !== 'app-connection') {
      return { sheet: false, banner: false };
    }

    // Show if there's a different active session (account mismatch)
    if (!differentActiveSession) {
      return { sheet: false, banner: false };
    }

    // Only show when address changed or first load (matching original Effect 3 logic)
    // Note: accountChangeHappened in original was never set to true, so effectively just firstLoad
    if (!addressChanged && !isFirstLoad) {
      return { sheet: false, banner: false };
    }

    // Determine whether to show sheet or banner
    const shouldShowSheet =
      nudgeSheetEnabled && !appHasInteractedWithNudgeSheet({ host: appHost });

    // Banner is hidden if it was hidden by timeout
    const shouldShowBanner = !shouldShowSheet && !bannerHiddenByTimeout;

    return {
      sheet: shouldShowSheet,
      banner: shouldShowBanner,
    };
  }, [
    isOnHomePage,
    hasValidUrl,
    differentActiveSession,
    nextInQueue,
    nudgeSheetEnabled,
    appHasInteractedWithNudgeSheet,
    appHost,
    addressChanged,
    isFirstLoad,
    bannerHiddenByTimeout,
  ]);

  const connect = useCallback(() => {
    if (appHost) {
      addSession({
        host: appHost,
        address: currentAddress,
        chainId: activeSession?.chainId || ChainId.mainnet,
        url,
      });
    }
    triggerToast({
      title: i18n.t('app_connection_switcher.banner.app_connected', {
        appName: dappMetadata?.appName || dappMetadata?.appHostName || 'dApp',
      }),
      description: chainsLabel[activeSession?.chainId || ChainId.mainnet],
    });
  }, [
    appHost,
    addSession,
    currentAddress,
    activeSession?.chainId,
    url,
    dappMetadata?.appName,
    dappMetadata?.appHostName,
    chainsLabel,
  ]);

  const handleConnect = useCallback(() => {
    connect();
    // Mark sheet as interacted when connecting from sheet
    if (shouldShowNudge.sheet && appHost) {
      setAppHasInteractedWithNudgeSheet({ host: appHost });
    }
  }, [
    connect,
    shouldShowNudge.sheet,
    appHost,
    setAppHasInteractedWithNudgeSheet,
  ]);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Reset banner hidden state when conditions change (address changed or first load)
  useEffect(() => {
    if (addressChanged || isFirstLoad) {
      setBannerHiddenByTimeout(false);
    }
  }, [addressChanged, isFirstLoad]);

  // Handle banner timeout - start timeout when banner is shown
  useEffect(() => {
    if (shouldShowNudge.banner) {
      timeoutRef.current = setTimeout(() => {
        setBannerHiddenByTimeout(true);
      }, 4000);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [shouldShowNudge.banner]);

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (!shouldShowNudge.banner && !shouldShowNudge.sheet) return;
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        hide();
      } else if (e.key === shortcuts.global.SELECT.key) {
        e.preventDefault();
        if (shouldShowNudge.sheet) {
          handleConnect();
        } else {
          connect();
        }
      }
    },
  });

  return (
    <>
      <Box opacity={shouldShowNudge.banner ? '1' : '0'}>
        <AppConnectionNudgeBanner
          show={shouldShowNudge.banner}
          connect={connect}
          hide={hide}
          bannerHoverRef={bannerHoverRef}
        />
      </Box>
      <AppConnectionNudgeSheet
        show={shouldShowNudge.sheet}
        connect={handleConnect}
        setShow={(show: boolean) => {
          // When user manually closes the sheet, set interaction flag so it won't show again
          if (!show && appHost) {
            setAppHasInteractedWithNudgeSheet({ host: appHost });
          }
        }}
      />
    </>
  );
};
