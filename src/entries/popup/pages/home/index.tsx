import {
  MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
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
  const smoothScrollY = useSpring(scrollY, {
    damping: 50,
    stiffness: 350,
  });
  const scrollYTx = useTransform(smoothScrollY, [1, 1000], [0, 200]);
  const [scrollAtTop, setScrollAtTop] = React.useState(true);

  React.useEffect(() => {
    scrollY.onChange((position) => {
      const isAtTop = position === 0;
      if (isAtTop && !scrollAtTop) setScrollAtTop(true);
      else if (!isAtTop && scrollAtTop) setScrollAtTop(false);
    });
  });

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <MainLayout
          className={className}
          style={{ ...style, position: 'relative', overscrollBehavior: 'none' }}
        >
          <TopNav />
          <Header />
          <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Content scrollSpring={scrollYTx} scrollAtTop={scrollAtTop}>
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
  scrollSpring,
  scrollAtTop,
}: {
  children: React.ReactNode;
  scrollSpring: MotionValue<number>;
  scrollAtTop: boolean;
}) {
  const y = scrollAtTop ? scrollSpring : 0;
  return (
    <Box
      background="surfacePrimaryElevated"
      style={{
        flex: 1,
        position: 'relative',
      }}
    >
      <Box height="full" as={motion.div} style={{ y }}>
        <Inset top="20px">{children}</Inset>
      </Box>
    </Box>
  );
}
