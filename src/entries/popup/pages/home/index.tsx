import {
  AnimatePresence,
  MotionValue,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';

import { analytics } from '~/analytics';
import { event } from '~/analytics/event';
import { usePendingRequestStore } from '~/core/state';
import { RainbowTransaction } from '~/core/types/transactions';
import { AccentColorProvider, Box, Inset, Separator } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { AccountName } from '../../components/AccountName/AccountName';
import { Navbar } from '../../components/Navbar/Navbar';
import { useAvatar } from '../../hooks/useAvatar';
import usePrevious from '../../hooks/usePrevious';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { MainLayout } from '../../layouts/MainLayout';
import { StickyHeader } from '../../layouts/StickyHeader';
import { ROUTES } from '../../urls';
import { SheetMode, SpeedUpAndCancelSheet } from '../speedUpAndCancelSheet';

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
  const { state } = useLocation();
  const { avatar } = useAvatar({ address });
  const [sheet, setSheet] = useState<SheetMode>('none');

  const navigate = useRainbowNavigate();

  const [speedUpAndCancelTx, setSpeedUpAndCancelTx] =
    useState<RainbowTransaction>();

  const displayingSheet = sheet !== 'none';

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

  const onSelectTab = useCallback((tab: Tab) => {
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
  const scrollYTransform = useTransform(smoothScrollY, [1, 1000], [0, 200]);
  const [scrollAtTop, setScrollAtTop] = useState(true);

  useEffect(() => {
    return scrollY.onChange((position) => {
      const isAtTop = position === 0;
      if (isAtTop && !scrollAtTop) setScrollAtTop(true);
      else if (!isAtTop && scrollAtTop) setScrollAtTop(false);
    });
  }, [scrollAtTop, scrollY]);

  useEffect(() => {
    analytics.track(event.walletViewed);
  }, []);

  const onSheetSelected = useCallback(
    ({
      sheet,
      transaction,
    }: {
      sheet: SheetMode;
      transaction: RainbowTransaction;
    }) => {
      setSheet(sheet);
      setSpeedUpAndCancelTx(transaction);
    },
    [],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (speedUpAndCancelTx?.pending) {
        if (e.key === 'Backspace') {
          onSheetSelected({
            sheet: 'cancel',
            transaction: speedUpAndCancelTx,
          });
        } else if (e.key === 's') {
          onSheetSelected({
            sheet: 'speedUp',
            transaction: speedUpAndCancelTx,
          });
        }
      }
    },
    [onSheetSelected, speedUpAndCancelTx],
  );

  useEffect(() => {
    if (speedUpAndCancelTx?.pending) {
      document.addEventListener('keydown', onKeyDown);
    } else {
      document.removeEventListener('keydown', onKeyDown);
    }
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown, speedUpAndCancelTx]);

  return (
    <AccentColorProvider color={avatar?.color || globalColors.blue50}>
      {({ className, style }) => (
        <>
          <MainLayout
            className={className}
            style={{
              ...style,
              position: 'relative',
              overscrollBehavior: 'none',
              height: 'auto',
              ...(displayingSheet ? { overflow: 'hidden' } : {}),
            }}
          >
            <TopNav />
            <Header />
            <TabBar activeTab={activeTab} setActiveTab={onSelectTab} />
            <Separator color="separatorTertiary" strokeWeight="1px" />
            <Content scrollSpring={scrollYTransform} shouldSpring={scrollAtTop}>
              {activeTab === 'tokens' && <Tokens />}
              {activeTab === 'activity' && (
                <Activity
                  currentSheet={sheet}
                  onSheetSelected={onSheetSelected}
                  setSelectedTransaction={(tx?: RainbowTransaction) =>
                    setSpeedUpAndCancelTx(tx)
                  }
                />
              )}
            </Content>
          </MainLayout>
          {sheet !== 'none' && (
            <SpeedUpAndCancelSheet
              cancel={sheet === 'cancel'}
              onClose={() => setSheet('none')}
              show={true}
              transaction={speedUpAndCancelTx}
            />
          )}
        </>
      )}
    </AccentColorProvider>
  );
}

function TopNav() {
  const { scrollY } = useScroll({ offset: ['0px', '64px'] });

  return (
    <StickyHeader
      background="surfacePrimaryElevatedSecondary"
      height={TOP_NAV_HEIGHT}
      topOffset={0}
    >
      <Navbar
        leftComponent={<NetworkMenu />}
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
          <AnimatePresence>
            {scrollY.get() && (
              <Box key="top-nav-account-name" as={motion.div}>
                <AccountName id="topNav" includeAvatar size="16pt" />
              </Box>
            )}
          </AnimatePresence>
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
  shouldSpring,
}: {
  children: React.ReactNode;
  scrollSpring?: MotionValue<number>;
  shouldSpring: boolean;
}) {
  const y = shouldSpring ? scrollSpring : 0;
  return (
    <Box
      background="surfacePrimaryElevated"
      style={{
        flex: 1,
        position: 'relative',
        contentVisibility: 'auto',
      }}
    >
      {/** spring transformY to imitate scroll bounce*/}
      <Box height="full" as={motion.div} style={{ y }}>
        <Inset top="20px">{children}</Inset>
      </Box>
    </Box>
  );
}
