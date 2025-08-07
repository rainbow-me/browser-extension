import { AnimatePresence, AnimationControls, motion } from 'framer-motion';
import React from 'react';

import { useCurrentAddressStore } from '~/core/state';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { AccentColorProvider, Box } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';
import { useAvatar } from '~/entries/popup/hooks/useAvatar';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { CommandKToolbar, TOOLBAR_HEIGHT } from './CommandKToolbar';
import { SearchItem } from './SearchItems';
import { CommandKPage } from './pageConfig';
import { useCommandKStatus } from './useCommandKStatus';

const HORIZONTAL_PADDING = 16;
const VERTICAL_PADDING = 66;

export const MODAL_WIDTH = POPUP_DIMENSIONS.width - HORIZONTAL_PADDING * 2;
export const MODAL_HEIGHT = POPUP_DIMENSIONS.height - VERTICAL_PADDING * 2;

const INPUT_HEIGHT = 56;
const SEPARATOR_HEIGHT = 1;
export const LIST_HEIGHT =
  MODAL_HEIGHT - INPUT_HEIGHT - SEPARATOR_HEIGHT - TOOLBAR_HEIGHT;

const springConfig = {
  type: 'spring',
  stiffness: 1111,
  damping: 50,
  mass: 1,
};
const timingConfig = {
  duration: 0.1,
  ease: [0.2, 0, 0, 1],
};

const modalStates = {
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springConfig,
  },
  closed: {
    opacity: 0,
    scale: 0.96,
    y: 0,
    transition: timingConfig,
  },
};
const scrimStates = {
  open: {
    opacity: 1,
    transition: springConfig,
  },
  closed: {
    opacity: 0,
    transition: timingConfig,
  },
};

export function CommandKModal({
  children,
  backAnimation,
  handleExecuteCommand,
  navigateTo,
  selectedCommand,
}: {
  children: React.ReactNode;
  backAnimation: AnimationControls;
  handleExecuteCommand: (command: SearchItem | null) => void;
  navigateTo: (page: CommandKPage, triggeredCommand: SearchItem) => void;
  selectedCommand: SearchItem | null;
}) {
  const { closeCommandK, isCommandKVisible, setFinishedExiting } =
    useCommandKStatus();
  const { currentAddress: address } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: address });
  const { currentTheme } = useCurrentThemeStore();

  return (
    <AnimatePresence onExitComplete={setFinishedExiting}>
      {isCommandKVisible && (
        <Box
          animate="open"
          aria-hidden="true"
          as={motion.div}
          bottom="0"
          exit="closed"
          initial="closed"
          key="commandKScrim"
          left="0"
          position="fixed"
          right="0"
          style={{
            backgroundColor:
              currentTheme === 'dark'
                ? 'rgba(23, 25, 26, 0.8)'
                : 'rgba(0, 0, 0, 0.5)',
            height: '100%',
            width: '100%',
            zIndex: zIndexes.COMMAND_K,
          }}
          variants={scrimStates}
        />
      )}
      {isCommandKVisible && (
        <Box
          alignItems="center"
          aria-modal="true"
          as={motion.div}
          bottom="0"
          display="flex"
          isModal
          justifyContent="center"
          key="commandKContainer"
          left="0"
          onClick={() => closeCommandK()}
          position="fixed"
          right="0"
          role="dialog"
          style={{
            height: '100%',
            width: '100%',
            willChange: 'transform',
            zIndex: zIndexes.COMMAND_K,
          }}
          top="0"
        >
          <Box
            animate={backAnimation}
            as={motion.div}
            key="backAnimationContainer"
            style={{ willChange: 'transform' }}
          >
            <Box
              animate="open"
              as={motion.div}
              borderRadius="20px"
              exit="closed"
              initial="closed"
              key="commandKModal"
              onClick={(e) => e.stopPropagation()}
              style={{
                backdropFilter: 'blur(30px)',
                background:
                  currentTheme === 'dark'
                    ? 'linear-gradient(180deg, rgba(36, 38, 41, 0.8) 0%, rgba(36, 38, 41, 0.7) 100%)'
                    : 'rgba(255, 255, 255, 0.92)',
                boxShadow:
                  currentTheme === 'dark'
                    ? '0px 15px 45px rgba(0, 0, 0, 0.3), 0px 0px 1px #000000'
                    : '0px 15px 45px rgba(0, 0, 0, 0.3), 0px 0px 1px rgba(0, 0, 0, 0.4)',
                height: MODAL_HEIGHT,
                overflow: 'hidden',
                width: MODAL_WIDTH,
                willChange: 'transform',
              }}
              variants={modalStates}
            >
              <AccentColorProvider color={avatar?.color ?? globalColors.blue60}>
                {children}
                <CommandKToolbar
                  handleExecuteCommand={handleExecuteCommand}
                  navigateTo={navigateTo}
                  selectedCommand={selectedCommand}
                />
                <Box
                  borderRadius="20px"
                  height="full"
                  left="0"
                  position="absolute"
                  style={{
                    boxShadow:
                      currentTheme === 'dark'
                        ? 'inset 0px 0.5px 2px rgba(245, 248, 255, 0.07), inset 0px -1px 6px rgba(245, 248, 255, 0.05)'
                        : 'inset 0px 0.5px 2px #FFFFFF, inset 0px -1px 6px #FFFFFF',
                    pointerEvents: 'none',
                  }}
                  top="0"
                  width="full"
                />
              </AccentColorProvider>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}
