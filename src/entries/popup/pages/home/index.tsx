import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { shortcuts } from '~/core/references/shortcuts';
import { usePendingRequestStore } from '~/core/state';
import { AccentColorProvider, Box, Inset, Separator } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { AccountName } from '../../components/AccountName/AccountName';
import { Navbar } from '../../components/Navbar/Navbar';
import { removeImportWalletSecrets } from '../../handlers/importWalletSecrets';
import { useAvatar } from '../../hooks/useAvatar';
import { useCurrentHomeSheet } from '../../hooks/useCurrentHomeSheet';
import { useHomeShortcuts } from '../../hooks/useHomeShortcuts';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import usePrevious from '../../hooks/usePrevious';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { useSwitchWalletShortcuts } from '../../hooks/useSwitchWalletShortcuts';
import { StickyHeader } from '../../layouts/StickyHeader';
import { ROUTES } from '../../urls';

import { Activity } from './Activity';
import { Header } from './Header';
import { MoreMenu } from './MoreMenu';
import { AppConnection } from './NetworkMenu';
import { TabBar as TabBar_ } from './TabBar';
import { Tokens } from './Tokens';

export type Tab = 'tokens' | 'activity';

const COLLAPSED_HEADER_TOP_OFFSET = 172;
const TAB_BAR_HEIGHT = 34;
const TOP_NAV_HEIGHT = 65;

export function Home() {
  const { address } = useAccount();
  const { state } = useLocation();
  const { avatar } = useAvatar({ address });
  const { currentHomeSheet, isDisplayingSheet } = useCurrentHomeSheet();

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

  const [activeTab, setActiveTab] = useState<Tab>(state?.activeTab || 'tokens');

  const [, startTransition] = useTransition();

  const onSelectTab = useCallback((tab: Tab) => {
    // If we are already in a state where the header is collapsed,
    // then ensure we are scrolling to the top when we change tab.
    if (window.scrollY > COLLAPSED_HEADER_TOP_OFFSET) {
      window.scrollTo({ top: COLLAPSED_HEADER_TOP_OFFSET });
    }
    startTransition(() => setActiveTab(tab));
  }, []);

  useEffect(() => {
    analytics.track(event.walletViewed);
    removeImportWalletSecrets();
  }, []);

  useKeyboardShortcut({
    handler: (e) => {
      if (e.key === shortcuts.global.BACK.key) {
        onSelectTab('tokens');
      }
      if (e.key === shortcuts.global.FORWARD.key) {
        onSelectTab('activity');
      }
    },
  });

  useHomeShortcuts();
  useSwitchWalletShortcuts();

  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <>
          <Box
            ref={scrollRef}
            className={className}
            display="flex"
            flexDirection="column"
            height="full"
            width="full"
            style={{
              ...style,
              position: 'relative',
              overscrollBehavior: 'none',
              height: 'auto',
              ...(isDisplayingSheet ? { overflow: 'hidden' } : {}),
            }}
          >
            <TopNav />
            <Header />
            <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
            <Separator color="separatorTertiary" strokeWeight="1px" />
            <Content>
              {activeTab === 'tokens' && <Tokens />}
              {activeTab === 'activity' && <Activity />}
            </Content>
          </Box>
          {currentHomeSheet}
        </>
      )}
    </AccentColorProvider>
  );
}

function TopNav() {
  const { scrollY } = useScroll();
  const [isCollapsed, setIsCollapsed] = useState(false);
  scrollY.on('change', (value) => setIsCollapsed(value >= 92));

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
            <Navbar.SymbolButton
              symbol="ellipsis"
              variant="flat"
              tabIndex={3}
            />
          </MoreMenu>
        }
        titleComponent={
          isCollapsed && (
            <Box
              key="top-nav-account-name"
              as={motion.div}
              paddingHorizontal="60px"
            >
              <AccountName id="topNav" includeAvatar size="16pt" />
            </Box>
          )
        }
      />
    </StickyHeader>
  );
}

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

function Content({ children }: PropsWithChildren) {
  const { scrollY } = useScroll({ axis: 'y' });
  const smoothScrollY = useSpring(scrollY, { damping: 50, stiffness: 350 });
  const scrollYTransform = useTransform(
    smoothScrollY,
    [0, 1000],
    [0, COLLAPSED_HEADER_TOP_OFFSET],
  );

  const [isTop, setIsTop] = useState(!!scrollY.get());
  useMotionValueEvent(scrollY, 'change', (y) => setIsTop(y < 1));
  const y = isTop ? scrollYTransform : 0;

  return (
    <Box
      background="surfacePrimaryElevated"
      style={{ flex: 1, position: 'relative', contentVisibility: 'auto' }}
    >
      {/** spring transformY to imitate scroll bounce*/}
      <Box height="full" as={motion.div} style={{ y }}>
        <Inset top="20px">{children}</Inset>
      </Box>
    </Box>
  );
}
