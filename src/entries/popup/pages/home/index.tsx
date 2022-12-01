import { motion, useScroll, useTransform } from 'framer-motion';
import * as React from 'react';
import { useAccount } from 'wagmi';

import { AccentColorProvider, Box, Inset, Separator } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { AccountName } from '../../components/AccountName/AccountName';
import { Navbar } from '../../components/Navbar/Navbar';
import { useAvatar } from '../../hooks/useAvatar';
import { MainLayout } from '../../layouts/MainLayout';
import { StickyHeader } from '../../layouts/StickyHeader';

import { Activity } from './Activity';
import { Header } from './Header';
import { MoreMenu } from './MoreMenu';
import { NetworkMenu } from './NetworkMenu';
import { TabBar as TabBar_ } from './TabBar';
import { Tokens } from './Tokens';

export type Tab = 'tokens' | 'activity';

const COLLAPSED_HEADER_TOP_OFFSET = 172;
const HEADER_HEIGHT = 266;
const TAB_BAR_HEIGHT = 34;
const TOP_NAV_HEIGHT = 65;

export function Home() {
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });

  const [activeTab, setActiveTab] = React.useState<Tab>('tokens');
  const onSelectTab = React.useCallback((tab: Tab) => {
    // If we are already in a state where the header is collapsed,
    // then ensure we are scrolling to the top when we change tab.
    if (window.scrollY > COLLAPSED_HEADER_TOP_OFFSET) {
      window.scrollTo({ top: COLLAPSED_HEADER_TOP_OFFSET });
    }
    setActiveTab(tab);
  }, []);

  const { scrollY } = useScroll();
  const [headerIsFixed, setHeaderIsFixed] = React.useState(true);
  const [tabbarIsFixed, setTabbarIsFixed] = React.useState(false);

  React.useEffect(() => {
    scrollY.onChange((scrollYPos = 0) => {
      if (scrollYPos === 0) {
        setHeaderIsFixed(true);
      } else setHeaderIsFixed(false);

      if (scrollYPos > HEADER_HEIGHT - (TAB_BAR_HEIGHT + TOP_NAV_HEIGHT)) {
        if (!tabbarIsFixed) {
          setTabbarIsFixed(true);
        }
      } else setTabbarIsFixed(false);
    });
  });

  const topFixedPosition = React.useMemo(() => {
    if (headerIsFixed) {
      return 0;
    }
    if (tabbarIsFixed) {
      return -Math.abs(HEADER_HEIGHT - (TAB_BAR_HEIGHT + TOP_NAV_HEIGHT));
    }
  }, [headerIsFixed, tabbarIsFixed]);

  const contentMargin = React.useMemo(() => {
    if (headerIsFixed) {
      return HEADER_HEIGHT;
    }
    if (tabbarIsFixed) {
      return TAB_BAR_HEIGHT + TOP_NAV_HEIGHT;
    }
    return 0;
  }, [headerIsFixed, tabbarIsFixed]);

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <MainLayout
          className={className}
          style={{ ...style, position: 'relative' }}
        >
          <Box
            width="full"
            position={headerIsFixed || tabbarIsFixed ? 'fixed' : undefined}
            style={{
              top: topFixedPosition,
            }}
          >
            <TopNav />
            <Header />
            <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
          </Box>
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Content marginTop={contentMargin}>
            {activeTab === 'tokens' && <Tokens />}
            {activeTab === 'activity' && <Activity />}
          </Content>
        </MainLayout>
      )}
    </AccentColorProvider>
  );
}

function TopNav() {
  const { scrollYProgress } = useScroll({ offset: ['0px', '64px'] });
  const opacity = useTransform(scrollYProgress, [0, 1, 1], [0, 0, 1]);

  return (
    <StickyHeader
      background="surfacePrimaryElevatedSecondary"
      height={TOP_NAV_HEIGHT}
      topOffset={0}
    >
      <Navbar
        leftComponent={
          <NetworkMenu>
            <Navbar.SymbolButton symbol="app.badge.checkmark" variant="flat" />
          </NetworkMenu>
        }
        rightComponent={
          <MoreMenu>
            <Navbar.SymbolButton symbol="ellipsis" variant="flat" />
          </MoreMenu>
        }
        titleComponent={
          <motion.div style={{ opacity }}>
            <AccountName id="topNav" includeAvatar size="16pt" />
          </motion.div>
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

function Content({
  children,
  marginTop,
}: {
  children: React.ReactNode;
  marginTop: number;
}) {
  return (
    <Box
      background="surfacePrimaryElevated"
      style={{
        flex: 1,
        marginTop,
      }}
    >
      <Inset top="20px">{children}</Inset>
    </Box>
  );
}
