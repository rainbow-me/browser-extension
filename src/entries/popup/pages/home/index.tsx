import { debug as logger } from '@sentry/core';
import { motion, useMotionValueEvent } from 'framer-motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { identifyWalletTypes } from '~/analytics/identify/walletTypes';
import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { useDelegationEnabled } from '~/core/resources/delegations/featureStatus';
import { useCurrentAddressStore } from '~/core/state';
import { useTabNavigation } from '~/core/state/currentSettings';
import { useErrorStore } from '~/core/state/error';
import { useRemoteConfigStore } from '~/core/state/remoteConfig';
import { usePendingRequestStore } from '~/core/state/requests';
import { goToNewTab } from '~/core/utils/tabs';
import { AccentColorProvider, Box, Separator } from '~/design-system';
import { triggerAlert } from '~/design-system/components/Alert/Alert';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { globalColors } from '~/design-system/styles/designTokens';
import { RainbowError } from '~/logger';

import { AccountName } from '../../components/AccountName/AccountName';
import { AppConnectionWalletSwitcher } from '../../components/AppConnection/AppConnectionWalletSwitcher';
import { BackupReminder } from '../../components/BackupReminder/BackupReminder';
import { Navbar } from '../../components/Navbar/Navbar';
import { ProactiveRevokeWatcher } from '../../components/ProactiveRevokeWatcher';
import { TabBar as NewTabBar, Tab } from '../../components/Tabs/TabBar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
import { WalletContextMenu } from '../../components/WalletContextMenu';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useAvatar } from '../../hooks/useAvatar';
import { useCurrentHomeSheet } from '../../hooks/useCurrentHomeSheet';
import { HomeShortcuts } from '../../hooks/useHomeShortcuts';
import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { PendingTransactionWatcher } from '../../hooks/usePendingTransactionWatcher';
import usePrevious from '../../hooks/usePrevious';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { RestoreNavigation } from '../../hooks/useRestoreNavigation';
import { useScroll } from '../../hooks/useScroll';
import { SwitchWalletShortcuts } from '../../hooks/useSwitchWalletShortcuts';
import { useVisibleTokenCount } from '../../hooks/useVisibleTokenCount';
import { useWallets } from '../../hooks/useWallets';
import { StickyHeader } from '../../layouts/StickyHeader';
import { ROUTES } from '../../urls';

import { Activities } from './Activity/ActivitiesList';
import { RevokeApproval } from './Approvals/RevokeApproval';
import { Header } from './Header';
import { MoreMenu } from './MoreMenu';
import { NFTs } from './NFTs/NFTs';
import { AppConnection } from './NetworkMenu';
import { RNBWRewards } from './Rewards/RNBWRewards';
import { TabHeader } from './TabHeader';
import { Tokens } from './Tokens';

const IS_TESTING = process.env.IS_TESTING === 'true';

const TOP_NAV_HEIGHT = 65;

const Tabs = memo(function Tabs({ visibleTabs }: { visibleTabs: Tab[] }) {
  const { trackShortcut } = useKeyboardAnalytics();
  const { visibleTokenCount } = useVisibleTokenCount();

  const { selectedTab: activeTab, setSelectedTab } = useTabNavigation();

  const containerRef = useContainerRef();
  const prevScrollPosition = useRef<number | undefined>(undefined);
  const { scrollY } = useScroll();

  const onSelectTab = (tab: Tab) => {
    prevScrollPosition.current = containerRef.current?.scrollTop;
    if (activeTab === tab && containerRef.current?.scrollTop !== 0) {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSelectedTab(tab);
  };

  const COLLAPSED_HEADER_TOP_OFFSET = 157;

  // Animate scroll position when switching tabs
  useEffect(() => {
    if (!containerRef.current) return;

    const top = prevScrollPosition.current;
    if (!top) return;

    containerRef.current.scrollTo({
      top:
        top > COLLAPSED_HEADER_TOP_OFFSET && visibleTokenCount > 8
          ? COLLAPSED_HEADER_TOP_OFFSET + 4
          : 0,
      behavior: 'smooth',
    });
  }, [activeTab, containerRef, visibleTokenCount]);

  useKeyboardShortcut({
    handler: (e) => {
      const currentIndex = visibleTabs.indexOf(activeTab);

      if (e.key === shortcuts.global.BACK.key && currentIndex > 0) {
        trackShortcut({
          key: shortcuts.global.BACK.display,
          type: 'home.switchTab',
        });
        onSelectTab(visibleTabs[currentIndex - 1]);
      }
      if (
        e.key === shortcuts.global.FORWARD.key &&
        currentIndex < visibleTabs.length - 1
      ) {
        trackShortcut({
          key: shortcuts.global.FORWARD.display,
          type: 'home.switchTab',
        });
        onSelectTab(visibleTabs[currentIndex + 1]);
      }
    },
  });

  return (
    <>
      <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
      <Box
        background="surfacePrimaryElevated"
        style={{ flex: 1, position: 'relative', contentVisibility: 'visible' }}
        height="full"
      >
        {activeTab === 'tokens' && <Tokens scrollY={scrollY} />}
        {activeTab === 'activity' && <Activities />}
        {activeTab === 'nfts' && <NFTs />}
        {activeTab === 'rewards' && <RNBWRewards />}
      </Box>
    </>
  );
});

export const Home = memo(function Home() {
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentHomeSheet, isDisplayingSheet } = useCurrentHomeSheet();
  const navigate = useRainbowNavigate();
  const delegationEnabled = useDelegationEnabled();
  const pendingRequests = usePendingRequestStore((s) => s.pendingRequests);
  const prevPendingRequest = usePrevious(pendingRequests?.[0]);
  const { isWatchingWallet } = useWallets();

  const nftsEnabled = useRemoteConfigStore((s) => s.nfts_enabled);
  const rnbwRewardsEnabled = useRemoteConfigStore(
    (s) => s.rnbw_rewards_enabled,
  );
  const approvalsEnabled = useRemoteConfigStore((s) => s.approvals_enabled);

  const visibleTabs = useMemo(() => {
    const tabs: Tab[] = ['tokens', 'activity'];

    // Add NFTs tab if feature flag is enabled or in testing/dev
    if (nftsEnabled || IS_TESTING) {
      tabs.push('nfts');
    }

    // Add Rewards tab if not watching wallet and feature flag is enabled (or in testing/dev)
    if (!isWatchingWallet && (rnbwRewardsEnabled || IS_TESTING)) {
      tabs.push('rewards');
    }

    return tabs;
  }, [isWatchingWallet, nftsEnabled, rnbwRewardsEnabled]);

  useEffect(() => {
    if (
      pendingRequests?.[0] &&
      pendingRequests?.[0].id !== prevPendingRequest?.id
    ) {
      navigate(ROUTES.APPROVE_APP_REQUEST);
    }
  }, [navigate, pendingRequests, prevPendingRequest?.id]);

  const { error, setError } = useErrorStore();
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
    analytics.track(event.walletViewed);
    identifyWalletTypes();
    removeImportWalletSecrets();
  }, []);

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
            <Tabs visibleTabs={visibleTabs} />
            <AppConnectionWalletSwitcher />
          </motion.div>
          <NewTabBar tabs={visibleTabs} />
          <BackupReminder />
          {currentHomeSheet}
          {approvalsEnabled ? <RevokeApproval /> : null}
          {delegationEnabled ? <ProactiveRevokeWatcher /> : null}

          <PendingTransactionWatcher />

          <HomeShortcuts />
          <RestoreNavigation />
          <SwitchWalletShortcuts />
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
  return (
    <StickyHeader
      background="surfacePrimaryElevatedSecondary"
      height={39}
      topOffset={TOP_NAV_HEIGHT}
    >
      <TabHeader activeTab={activeTab} onSelectTab={setActiveTab} />
      <Box position="relative" style={{ bottom: 1 }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
    </StickyHeader>
  );
}
