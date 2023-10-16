import { motion, useMotionValueEvent } from 'framer-motion';
import {
  PropsWithChildren,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { identifyWalletTypes } from '~/analytics/identify/walletTypes';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useCurrentAddressStore, usePendingRequestStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { useErrorStore } from '~/core/state/error';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { goToNewTab, isNativePopup } from '~/core/utils/tabs';
import { AccentColorProvider, Box, Inset, Separator } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { globalColors } from '~/design-system/styles/designTokens';
import { RainbowError, logger } from '~/logger';

import { AccountName } from '../../components/AccountName/AccountName';
import { AppConnectionWalletSwitcher } from '../../components/AppConnection/AppConnectionWalletSwitcher';
import { BackupReminder } from '../../components/BackupReminder/BackupReminder';
import { Navbar } from '../../components/Navbar/Navbar';
import { TabBar as NewTabBar } from '../../components/Tabs/TabBar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { WalletContextMenu } from '../../components/WalletContextMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useAvatar } from '../../hooks/useAvatar';
import { useCurrentHomeSheet } from '../../hooks/useCurrentHomeSheet';
import { useHomeShortcuts } from '../../hooks/useHomeShortcuts';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { usePendingTransactionWatcher } from '../../hooks/usePendingTransactionWatcher';
import usePrevious from '../../hooks/usePrevious';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import useRestoreNavigation from '../../hooks/useRestoreNavigation';
import { useScroll } from '../../hooks/useScroll';
import { useSwitchWalletShortcuts } from '../../hooks/useSwitchWalletShortcuts';
import { StickyHeader } from '../../layouts/StickyHeader';
import { ROUTES } from '../../urls';

import { Activities } from './Activity/ActivitiesList';
import { Header } from './Header';
import { MoreMenu } from './MoreMenu';
import { NFTs } from './NFTs';
import { AppConnection } from './NetworkMenu';
import { TabBar as TabBar_ } from './TabBar';
import { TabHeader } from './TabHeader';
import { Tokens } from './Tokens';

export type Tab = 'tokens' | 'activity' | 'nfts';

const TAB_BAR_HEIGHT = 34;
const TOP_NAV_HEIGHT = 65;

type TabProps = {
  activeTab: Tab;
  containerRef: React.RefObject<HTMLDivElement>;
  onSelectTab: (tab: Tab) => void;
  prevScrollPosition: React.MutableRefObject<number | undefined>;
  setActiveTab: (tab: Tab) => void;
};

const Tabs = memo(function Tabs({
  activeTab,
  containerRef,
  onSelectTab,
  prevScrollPosition,
  setActiveTab,
}: TabProps) {
  const { featureFlags } = useFeatureFlagsStore();
  const { trackShortcut } = useKeyboardAnalytics();
  const { activeTab: popupActiveTab } = usePopupInstanceStore();

  const { state } = useLocation();

  const COLLAPSED_HEADER_TOP_OFFSET = featureFlags.new_tab_bar_enabled
    ? 157
    : 160;

  useEffect(() => {
    const mountWithSavedTabInPopup = async () => {
      const isPopup = await isNativePopup();
      if (state?.tab) {
        setActiveTab(state.tab);
      } else if (isPopup) {
        setActiveTab(popupActiveTab);
      }
    };
    mountWithSavedTabInPopup();
  }, [popupActiveTab, setActiveTab, state?.tab]);

  // If we are already in a state where the header is collapsed,
  // then ensure we are scrolling to the top when we change tab.
  // It's a useLayoutEffect because we want to set the scroll position
  // right before the DOM is repainted with the new tab,
  // so we don't have any flicker
  useLayoutEffect(() => {
    const top = prevScrollPosition.current;
    if (!top || !containerRef.current) return;
    containerRef.current.scrollTo({
      top:
        top > COLLAPSED_HEADER_TOP_OFFSET
          ? COLLAPSED_HEADER_TOP_OFFSET + 4 // don't know why, but +4 solves a shift :)
          : 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useKeyboardShortcut({
    handler: (e) => {
      if (featureFlags.new_tab_bar_enabled) {
        if (e.key === shortcuts.global.BACK.key) {
          trackShortcut({
            key: shortcuts.global.BACK.display,
            type: 'home.switchTab',
          });
          if (activeTab === 'tokens') {
            onSelectTab('activity');
          } else if (activeTab === 'nfts') {
            onSelectTab('tokens');
          }
        }
        if (e.key === shortcuts.global.FORWARD.key) {
          trackShortcut({
            key: shortcuts.global.FORWARD.display,
            type: 'home.switchTab',
          });
          if (activeTab === 'tokens') {
            onSelectTab('nfts');
          } else if (activeTab === 'activity') {
            onSelectTab('tokens');
          }
        }
      } else {
        if (e.key === shortcuts.global.BACK.key) {
          trackShortcut({
            key: shortcuts.global.BACK.display,
            type: 'home.switchTab',
          });
          onSelectTab('tokens');
        }
        if (e.key === shortcuts.global.FORWARD.key) {
          trackShortcut({
            key: shortcuts.global.FORWARD.display,
            type: 'home.switchTab',
          });
          onSelectTab('activity');
        }
      }
    },
  });

  return (
    <>
      <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
      <Content>
        {activeTab === 'activity' && <Activities />}
        {activeTab === 'tokens' && <Tokens />}
        {activeTab === 'nfts' && <NFTs />}
      </Content>
    </>
  );
});

export const Home = memo(function Home() {
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentHomeSheet, isDisplayingSheet } = useCurrentHomeSheet();
  const { featureFlags } = useFeatureFlagsStore();
  const { activeTab: popupActiveTab, saveActiveTab } = usePopupInstanceStore();
  const { error, setError } = useErrorStore();
  const navigate = useRainbowNavigate();
  const { pendingRequests } = usePendingRequestStore();
  const prevPendingRequest = usePrevious(pendingRequests?.[0]);
  const [activeTab, setActiveTab] = useState<Tab>(popupActiveTab);
  const containerRef = useContainerRef();
  const prevScrollPosition = useRef<number | undefined>(undefined);

  const onSelectTab = (tab: Tab) => {
    prevScrollPosition.current = containerRef.current?.scrollTop;
    setActiveTab(tab);
    saveActiveTab({ tab });
  };

  useEffect(() => {
    if (error) {
      triggerAlert({
        action: () =>
          goToNewTab({
            url: 'https://rainbow.me/extension/support?report=true',
          }),
        actionText: i18n.t('errors.report_error'),
        text: i18n.t('errors.error_encountered'),
      });
      logger.error(new RainbowError('Error Boundary Did Catch: '), {
        message: error.message,
        stack: error.stack,
      });
      setError(null);
    }
  }, [error, setError]);

  useEffect(() => {
    if (
      pendingRequests?.[0] &&
      pendingRequests?.[0].id !== prevPendingRequest?.id
    ) {
      navigate(ROUTES.APPROVE_APP_REQUEST);
    }
  }, [navigate, pendingRequests, prevPendingRequest?.id]);

  useEffect(() => {
    analytics.track(event.walletViewed);
    identifyWalletTypes();
    removeImportWalletSecrets();
  }, []);

  usePendingTransactionWatcher({ address: currentAddress });
  useHomeShortcuts();
  useRestoreNavigation();
  useSwitchWalletShortcuts();

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <>
          <motion.div
            className={className}
            style={{
              ...style,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: 'full',
              overscrollBehavior: 'none',
              height: 'auto',
              ...(isDisplayingSheet ? { overflow: 'hidden' } : {}),
            }}
          >
            <TopNav />
            <Header />
            <Tabs
              activeTab={activeTab}
              containerRef={containerRef}
              onSelectTab={onSelectTab}
              prevScrollPosition={prevScrollPosition}
              setActiveTab={setActiveTab}
            />
            <AppConnectionWalletSwitcher />
          </motion.div>
          {featureFlags.new_tab_bar_enabled && (
            <NewTabBar activeTab={activeTab} onSelectTab={onSelectTab} />
          )}
          <BackupReminder />
          {currentHomeSheet}
        </>
      )}
    </AccentColorProvider>
  );
});

const TopNav = memo(function TopNav() {
  const { currentAddress: address } = useCurrentAddressStore();

  const { scrollY } = useScroll();
  const [isCollapsed, setIsCollapsed] = useState(scrollY.get() > 91);
  useMotionValueEvent(scrollY, 'change', (y) => setIsCollapsed(y > 91));

  return (
    <StickyHeader
      background="surfacePrimaryElevatedSecondary"
      height={TOP_NAV_HEIGHT}
      topOffset={0}
    >
      <Navbar
        leftComponent={<AppConnection />}
        rightComponent={
          <MoreMenu>
            <CursorTooltip
              align="end"
              arrowAlignment="right"
              arrowDirection="up"
              arrowCentered
              text={i18n.t('tooltip.more')}
              textWeight="bold"
              textSize="12pt"
              textColor="labelSecondary"
              hint={shortcuts.home.OPEN_MORE_MENU.display}
            >
              <Navbar.SymbolButton
                symbol="ellipsis"
                variant="flat"
                tabIndex={3}
              />
            </CursorTooltip>
          </MoreMenu>
        }
        titleComponent={
          isCollapsed && (
            <WalletContextMenu account={address}>
              <Box
                key="top-nav-account-name"
                as={motion.div}
                paddingHorizontal="60px"
              >
                <AccountName
                  id="topNav"
                  avatar={
                    address && (
                      <Box paddingRight="2px">
                        <WalletAvatar
                          addressOrName={address}
                          size={16}
                          emojiSize="10pt"
                        />
                      </Box>
                    )
                  }
                  size="16pt"
                />
              </Box>
            </WalletContextMenu>
          )
        }
      />
    </StickyHeader>
  );
});

function TabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const { featureFlags } = useFeatureFlagsStore();

  return (
    <StickyHeader
      background="surfacePrimaryElevatedSecondary"
      height={featureFlags.new_tab_bar_enabled ? 39 : TAB_BAR_HEIGHT}
      topOffset={TOP_NAV_HEIGHT}
    >
      {featureFlags.new_tab_bar_enabled ? (
        <TabHeader activeTab={activeTab} onSelectTab={setActiveTab} />
      ) : (
        <TabBar_ activeTab={activeTab} onSelectTab={setActiveTab} />
      )}
      <Box position="relative" style={{ bottom: 1 }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
    </StickyHeader>
  );
}

function Content({ children }: PropsWithChildren) {
  const { featureFlags } = useFeatureFlagsStore();
  const { testnetMode } = useTestnetModeStore();

  const bottom = useMemo(() => {
    if (testnetMode) return '104px';
    else if (featureFlags.new_tab_bar_enabled) return '64px';
    return undefined;
  }, [featureFlags.new_tab_bar_enabled, testnetMode]);

  return (
    <Box
      background="surfacePrimaryElevated"
      style={{ flex: 1, position: 'relative', contentVisibility: 'visible' }}
    >
      <Inset top="20px" bottom={bottom}>
        {children}
      </Inset>
    </Box>
  );
}
