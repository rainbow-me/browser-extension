import {
  motion,
  transform,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  PropsWithChildren,
  memo,
  useEffect,
  useLayoutEffect,
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
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { isNativePopup } from '~/core/utils/tabs';
import { AccentColorProvider, Box, Inset, Separator } from '~/design-system';
import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';
import { globalColors } from '~/design-system/styles/designTokens';

import { AccountName } from '../../components/AccountName/AccountName';
import { AppConnectionWalletSwitcher } from '../../components/AppConnection/AppConnectionWalletSwitcher';
import { BackupReminder } from '../../components/BackupReminder/BackupReminder';
import { Navbar } from '../../components/Navbar/Navbar';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { WalletAvatar } from '../../components/WalletAvatar/WalletAvatar';
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
import { AppConnection } from './NetworkMenu';
import { TabBar as TabBar_ } from './TabBar';
import { Tokens } from './Tokens';

export type Tab = 'tokens' | 'activity';

const COLLAPSED_HEADER_TOP_OFFSET = 172;
const TAB_BAR_HEIGHT = 34;
const TOP_NAV_HEIGHT = 65;

const Tabs = memo(function Tabs() {
  const { activeTab: popupActiveTab, saveActiveTab } = usePopupInstanceStore();
  const { state } = useLocation();

  const [activeTab, setActiveTab] = useState<Tab>('tokens');
  const { trackShortcut } = useKeyboardAnalytics();

  const containerRef = useContainerRef();
  const prevScrollPosition = useRef<number | undefined>(undefined);
  const onSelectTab = (tab: Tab) => {
    prevScrollPosition.current = containerRef.current?.scrollTop;
    setActiveTab(tab);
    saveActiveTab({ tab });
  };

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
  }, [popupActiveTab, state?.tab]);

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
          : top,
    });
  }, [containerRef]);

  useKeyboardShortcut({
    handler: (e) => {
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
    },
  });

  return (
    <>
      <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
      <Separator color="separatorTertiary" strokeWeight="1px" />
      <Content>
        {activeTab === 'tokens' && <Tokens />}
        {activeTab === 'activity' && <Activities />}
      </Content>
    </>
  );
});

export const Home = memo(function Home() {
  const { currentAddress } = useCurrentAddressStore();
  const { avatar } = useAvatar({ address: currentAddress });
  const { currentHomeSheet, isDisplayingSheet } = useCurrentHomeSheet();

  usePendingTransactionWatcher({ address: currentAddress });

  const navigate = useRainbowNavigate();

  const { pendingRequests } = usePendingRequestStore();

  const prevPendingRequest = usePrevious(pendingRequests?.[0]);
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
            <Tabs />
            <AppConnectionWalletSwitcher />
          </motion.div>
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
              text={i18n.t('tooltip.more')}
              textWeight="bold"
              textSize="12pt"
              textColor="labelSecondary"
              marginLeft="30px"
              marginTop="76px"
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
            <Box
              key="top-nav-account-name"
              as={motion.div}
              paddingHorizontal="60px"
            >
              <CursorTooltip
                align="center"
                arrowAlignment="center"
                text={i18n.t('tooltip.switch_wallet')}
                textWeight="bold"
                textSize="12pt"
                textColor="labelSecondary"
                marginLeft="72px"
                marginTop="68px"
                arrowDirection={'up'}
                hint={shortcuts.home.GO_TO_WALLETS.display}
              >
                <AccountName
                  id="topNav"
                  avatar={
                    address && (
                      <Box paddingRight="2px">
                        <WalletAvatar
                          address={address}
                          size={16}
                          emojiSize="10pt"
                        />
                      </Box>
                    )
                  }
                  size="16pt"
                />
              </CursorTooltip>
            </Box>
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
      height={TAB_BAR_HEIGHT}
      topOffset={TOP_NAV_HEIGHT}
    >
      <TabBar_ activeTab={activeTab} onSelectTab={setActiveTab} />
    </StickyHeader>
  );
}

const transformListScrollBounce = (y: number) =>
  transform(y, [0, 1000], [0, COLLAPSED_HEADER_TOP_OFFSET]);
function Content({ children }: PropsWithChildren) {
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { damping: 50, stiffness: 350 });
  const y = useTransform(smoothScrollY, (springY) =>
    scrollY.get() < 1 ? transformListScrollBounce(springY) : 0,
  );

  return (
    <Box
      background="surfacePrimaryElevated"
      style={{ flex: 1, position: 'relative', contentVisibility: 'visible' }}
    >
      {/** spring transformY to imitate scroll bounce*/}
      <Box height="full" as={motion.div} style={{ y }}>
        <Inset top="20px">{children}</Inset>
      </Box>
    </Box>
  );
}
