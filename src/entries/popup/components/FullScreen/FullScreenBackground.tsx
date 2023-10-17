import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box, Inline, Text } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { zIndexes } from '../../utils/zIndexes';
import { MenuItem } from '../Menu/MenuItem';
import { TestnetBarBackground } from '../TestnetBarBackground/TestnetBarBackground';

const TestnetBar = ({ testnetMode }: { testnetMode: boolean }) => {
  return (
    <AnimatePresence initial={false}>
      {testnetMode && (
        <Box
          as={motion.div}
          key={'testnet-bar'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 36 }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            width: POPUP_DIMENSIONS.width,
            zIndex: zIndexes.SPEED_UP_CANCEL_PROMPT,
            backgroundColor: 'rgba(62, 207, 91, 0.06)',
            borderColor: globalColors.green90,
          }}
          paddingHorizontal="8px"
          paddingVertical="8px"
          borderWidth="1px"
        >
          <Inline
            height="full"
            space="4px"
            alignVertical="center"
            alignHorizontal="center"
          >
            <Box
              position="absolute"
              style={{
                overflow: 'clip',
              }}
              marginRight="-12px"
            >
              <TestnetBarBackground />
            </Box>
            <MenuItem.TextIcon icon="🕹" />
            <Text align="center" color="green" size="12pt" weight="heavy">
              Testnet Mode
            </Text>
          </Inline>
        </Box>
      )}
    </AnimatePresence>
  );
};
export function FullScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentTheme } = useCurrentThemeStore();
  const isFullscreen = useIsFullScreen();
  const { testnetMode } = useTestnetModeStore();

  if (!isFullscreen)
    return (
      <Box style={{ overflow: 'hidden' }}>
        <TestnetBar testnetMode={testnetMode} />
        <Box style={{ overflow: 'auto' }}>{children}</Box>
      </Box>
    );

  return (
    <Box
      position="absolute"
      display="flex"
      width="full"
      height="full"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      style={{
        backgroundColor: currentTheme === 'dark' ? '#131314' : '#E7E8E9',
        width: '100vw',
        height: '100vh',
      }}
    >
      <Box
        width="full"
        height="full"
        style={{
          position: 'absolute',
          top: '0px',
          backgroundImage: 'url(assets/bg/noise.png)',
          backgroundSize: '50%',
          backgroundRepeat: 'repeat',
          opacity: 0.25,
          mixBlendMode: 'overlay',
          left: '0px',
          width: '100vw',
          height: '100vh',
        }}
      />
      <Box
        borderRadius="32px"
        background="surfacePrimaryElevated"
        style={{
          width: POPUP_DIMENSIONS.width,
          height: POPUP_DIMENSIONS.height,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <TestnetBar testnetMode={testnetMode} />
        <Box style={{ overflow: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
