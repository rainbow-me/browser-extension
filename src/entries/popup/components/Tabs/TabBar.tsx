import chroma from 'chroma-js';
import { motion } from 'framer-motion';
import { ReactElement, memo, useMemo } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useTabNavigation } from '~/core/state/currentSettings/tabNavigation';
import { Box, Inline } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';
import { zIndexes } from '../../utils/zIndexes';
import { timingConfig } from '../CommandK/references';

import ActivityIcon from './TabIcons/Activity';
import ActivitySelected from './TabIcons/ActivitySelected';
import HomeIcon from './TabIcons/Home';
import HomeSelected from './TabIcons/HomeSelected';
import NFTsIcon from './TabIcons/NFTs';
import NFTsSelected from './TabIcons/NFTsSelected';
import PointsIcon from './TabIcons/Points';
import PointsSelected from './TabIcons/PointsSelected';

export const ICON_SIZE = 36;

const TAB_HEIGHT = 32;
const TAB_WIDTH = 42;

type TabConfigType = {
  Icon: () => ReactElement;
  SelectedIcon: ({
    accentColor,
    colorMatrixValues,
  }: {
    accentColor: string;
    colorMatrixValues: number[];
  }) => ReactElement;
  name: 'tokens' | 'activity' | 'nfts' | 'points';
};

const tabConfig: TabConfigType[] = [
  {
    Icon: HomeIcon,
    SelectedIcon: HomeSelected,
    name: 'tokens',
  },
  {
    Icon: ActivityIcon,
    SelectedIcon: ActivitySelected,
    name: 'activity',
  },
  {
    Icon: NFTsIcon,
    SelectedIcon: NFTsSelected,
    name: 'nfts',
  },
  {
    Icon: PointsIcon,
    SelectedIcon: PointsSelected,
    name: 'points',
  },
];

export type Tab = (typeof tabConfig)[number]['name'];

export const TabBar = memo(function TabBar({ tabs }: { tabs: Tab[] }) {
  const height = 44;
  const { selectedTab, setSelectedTab } = useTabNavigation();

  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const { currentTheme } = useCurrentThemeStore();

  // Convert accent color to SVG color matrix values
  const colorMatrixValues = useMemo(() => {
    const accentColorAsRgb = chroma(avatar?.color || globalColors.blue50).rgb();
    const rgbValues = accentColorAsRgb.map((value: number) => value / 255);
    return currentTheme === 'dark' ? [0, 0, 0] : rgbValues;
  }, [avatar?.color, currentTheme]);

  const visibleTabs = useMemo(() => {
    return tabConfig.filter((tab) => tabs.includes(tab.name));
  }, [tabs]);

  return (
    <Box
      alignItems="center"
      id="tab-bar"
      as={motion.div}
      borderRadius="16px"
      display="flex"
      justifyContent="center"
      key="tabBarContainer"
      padding="6px"
      position="absolute"
      style={{
        alignSelf: 'center',
        backdropFilter: 'blur(15px)',
        background:
          currentTheme === 'dark'
            ? 'linear-gradient(180deg, rgba(36, 37, 41, 0.6) 0%, rgba(36, 37, 41, 0.8) 100%)'
            : 'linear-gradient(180deg, rgba(250, 250, 250, 0.6) 0%, rgba(240, 240, 240, 0.8) 100%)',
        bottom: 20,
        boxShadow:
          currentTheme === 'dark'
            ? '0 16px 32px 0 rgba(0, 0, 0, 0.5), 0 0 0.5px 0 #000000, 0 -1px 6px 0 rgba(245, 248, 255, 0.05) inset, 0 0.5px 2px 0 rgba(245, 248, 255, 0.1) inset'
            : '0 16px 32px 0 rgba(0, 0, 0, 0.15), 0 0 1px 0 rgba(0, 0, 0, 0.08), 0 -1px 6px 0 rgba(255, 255, 255, 0.8) inset, 0 0.5px 2px 0 rgba(255, 255, 255, 0.8) inset',
        height: height,
        zIndex: zIndexes.TAB_BAR,
      }}
      transition={timingConfig(0.2)}
    >
      <TabBackground
        selectedTabIndex={visibleTabs.findIndex(
          (tab) => tab.name === selectedTab,
        )}
      />
      <Inline
        alignHorizontal="center"
        alignVertical="center"
        height="full"
        space="4px"
      >
        {visibleTabs.map((tab, index) => {
          return (
            <Tab
              Icon={tab.Icon}
              SelectedIcon={tab.SelectedIcon}
              accentColor={avatar?.color || globalColors.blue50}
              colorMatrixValues={colorMatrixValues}
              index={index}
              key={index}
              name={tab.name}
              onSelectTab={setSelectedTab}
              selectedTabIndex={visibleTabs.findIndex(
                (tab) => tab.name === selectedTab,
              )}
            />
          );
        })}
      </Inline>
    </Box>
  );
});

function Tab({
  Icon,
  SelectedIcon,
  accentColor,
  colorMatrixValues,
  index,
  name,
  onSelectTab,
  selectedTabIndex,
}: {
  Icon: () => ReactElement;
  SelectedIcon: ({
    accentColor,
    colorMatrixValues,
  }: {
    accentColor: string;
    colorMatrixValues: number[];
  }) => ReactElement;
  accentColor: string;
  colorMatrixValues: number[];
  index: number;
  name: Tab;
  onSelectTab: (tab: Tab) => void;
  selectedTabIndex: number;
}) {
  const isSelected = selectedTabIndex === index;

  return (
    <Box
      onClick={() => {
        onSelectTab(name);
      }}
      style={{ height: TAB_HEIGHT, width: TAB_WIDTH }}
      testId={`bottom-tab-${name}`}
    >
      <Box
        alignItems="center"
        as={motion.div}
        display="flex"
        height="full"
        justifyContent="center"
        key={`tab-${name}`}
        style={{
          width: TAB_WIDTH,
          willChange: 'transform',
          zIndex: 2,
        }}
        transition={timingConfig(0.2)}
        whileTap={{ scale: 0.82 }}
      >
        <Box style={{ height: ICON_SIZE, width: ICON_SIZE }}>
          <Box
            position="relative"
            style={{
              height: ICON_SIZE * 2,
              transform: 'scale(0.5)',
              transformOrigin: 'top left',
              width: ICON_SIZE * 2,
              willChange: 'transform',
            }}
          >
            <Box
              position="absolute"
              style={{
                opacity: isSelected ? 1 : 0,
                transition: '0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <SelectedIcon
                accentColor={accentColor}
                colorMatrixValues={colorMatrixValues}
              />
            </Box>
            <Box
              position="absolute"
              style={{
                opacity: isSelected ? 0 : 1,
                transition: '0.2s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <Icon />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function TabBackground({ selectedTabIndex }: { selectedTabIndex: number }) {
  const { currentTheme } = useCurrentThemeStore();
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });

  // 6 = tab bar horizontal padding; 4 = space between tabs
  const xPosition = selectedTabIndex * TAB_WIDTH + (6 + selectedTabIndex * 4);

  return (
    <Box
      borderRadius="10px"
      position="absolute"
      style={{
        backgroundColor: avatar?.color || globalColors.blue50,
        height: TAB_HEIGHT,
        left: 0,
        opacity: currentTheme === 'dark' ? 0.2 : 0.15,
        top: 6,
        transform: `translateX(${xPosition}px)`,
        transition: '0.2s cubic-bezier(0.2, 0, 0, 1)',
        width: TAB_WIDTH,
        willChange: 'transform',
      }}
    />
  );
}
