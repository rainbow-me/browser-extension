import chroma from 'chroma-js';
import { motion } from 'framer-motion';
import { ReactElement, useMemo } from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inline } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';
import { Tab } from '../../pages/home';
import { timingConfig } from '../CommandK/references';

import ActivityIcon from './TabIcons/Activity';
import ActivitySelected from './TabIcons/ActivitySelected';
import HomeIcon from './TabIcons/Home';
import HomeSelected from './TabIcons/HomeSelected';
import NFTsIcon from './TabIcons/NFTs';
import NFTsSelected from './TabIcons/NFTsSelected';

export const ICON_SIZE = 36;

const TAB_HEIGHT = 32;
const TAB_WIDTH = 42;

const tabNames = ['activity', 'tokens', 'nfts'];

type TabConfigType = {
  Icon: () => ReactElement;
  SelectedIcon: ({
    accentColor,
    colorMatrixValues,
  }: {
    accentColor: string;
    colorMatrixValues: number[];
  }) => ReactElement;
  name: Tab;
};

const tabConfig: TabConfigType[] = [
  {
    Icon: ActivityIcon,
    SelectedIcon: ActivitySelected,
    name: 'activity',
  },
  {
    Icon: HomeIcon,
    SelectedIcon: HomeSelected,
    name: 'tokens',
  },
  {
    Icon: NFTsIcon,
    SelectedIcon: NFTsSelected,
    name: 'nfts',
  },
];

export function TabBar({
  activeTab,
  height = 44,
  onSelectTab,
}: {
  activeTab: Tab;
  height?: number;
  onSelectTab: (tab: Tab) => void;
}) {
  const { currentAddress } = useCurrentAddressStore();
  const { avatar } = useAvatar({ address: currentAddress });
  const { currentTheme } = useCurrentThemeStore();

  // Convert accent color to SVG color matrix values
  const colorMatrixValues = useMemo(() => {
    const accentColorAsRgb = chroma(avatar?.color || globalColors.blue50).rgb();
    const rgbValues = accentColorAsRgb.map((value: number) => value / 255);
    return currentTheme === 'dark' ? [0, 0, 0] : rgbValues;
  }, [avatar?.color, currentTheme]);

  return (
    <Box
      alignItems="center"
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
        zIndex: 5,
      }}
      transition={timingConfig(0.2)}
    >
      <TabBackground selectedTabIndex={tabNames.indexOf(activeTab)} />
      <Inline
        alignHorizontal="center"
        alignVertical="center"
        height="full"
        space="6px"
      >
        {tabConfig.map((tab, index) => (
          <Tab
            Icon={tab.Icon}
            SelectedIcon={tab.SelectedIcon}
            accentColor={avatar?.color || globalColors.blue50}
            colorMatrixValues={colorMatrixValues}
            index={index}
            key={index}
            name={tab.name}
            onSelectTab={onSelectTab}
            selectedTabIndex={tabNames.indexOf(activeTab)}
          />
        ))}
      </Inline>
    </Box>
  );
}

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
  const { avatar } = useAvatar({ address: currentAddress });

  const xPosition = selectedTabIndex * TAB_WIDTH + (selectedTabIndex + 1) * 6;

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
