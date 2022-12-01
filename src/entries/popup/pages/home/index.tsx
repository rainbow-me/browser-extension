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

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <MainLayout
          className={className}
          style={{ ...style, position: 'relative' }}
        >
          <Box width="full" style={{ position: 'fixed', top: 0 }}>
            <TopNav />
            <Header />
            <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
          </Box>
          <Separator color="separatorTertiary" strokeWeight="1px" />
          <Content>
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
      height={64}
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
      height={34}
      topOffset={64}
    >
      <TabBar_ activeTab={activeTab} onSelectTab={setActiveTab} />
    </StickyHeader>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <Box
      background="surfacePrimaryElevated"
      style={{
        flex: 1,
        marginTop: 265,
      }}
    >
      <Inset top="20px">{children}</Inset>
    </Box>
  );
}
