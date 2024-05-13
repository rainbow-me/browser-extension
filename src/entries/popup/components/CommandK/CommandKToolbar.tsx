import { AnimatePresence, motion } from 'framer-motion';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box, Inline, Text } from '~/design-system';
import {
  foregroundColors,
  globalColors,
} from '~/design-system/styles/designTokens';

import { SearchItem } from './SearchItems';
import { CommandKPage } from './pageConfig';
import { actionLabels, springConfig, timingConfig } from './references';

export const TOOLBAR_HEIGHT = 40;

export function CommandKToolbar({
  handleExecuteCommand,
  navigateTo,
  selectedCommand,
}: {
  handleExecuteCommand: (command: SearchItem | null) => void;
  navigateTo: (page: CommandKPage, triggeredCommand: SearchItem) => void;
  selectedCommand: SearchItem | null;
}) {
  const { currentTheme } = useCurrentThemeStore();

  return (
    <AnimatePresence initial={false}>
      {selectedCommand && (
        <Box
          alignItems="center"
          animate={{ bottom: 0, opacity: 1 }}
          as={motion.div}
          bottom="0"
          display="flex"
          exit={{ bottom: -TOOLBAR_HEIGHT, opacity: 0 }}
          initial={{ bottom: -TOOLBAR_HEIGHT, opacity: 0 }}
          key="commandKToolbar"
          paddingHorizontal="14px"
          position="absolute"
          style={{
            backgroundColor:
              currentTheme === 'dark'
                ? globalColors.blueGrey100
                : 'rgba(255, 255, 255, 0.05)',
            boxShadow:
              currentTheme === 'dark'
                ? '0 -0.5px 0 0 rgba(0, 0, 0, 0.125), 0 -3px 9px 0 rgba(0, 0, 0, 0.04)'
                : '0 -0.5px 0 0 rgba(9, 17, 31, 0.025), 0 -3px 9px 0 rgba(9, 17, 31, 0.02)',
            height: TOOLBAR_HEIGHT,
            willChange: 'transform',
          }}
          transition={timingConfig()}
          width="full"
        >
          <Box
            height="full"
            left="0"
            position="absolute"
            style={{
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              boxShadow:
                currentTheme === 'dark'
                  ? '0 0.5px 2px 0 rgba(245, 248, 255, 0.07) inset'
                  : '0 -1px 6px 0 #FFFFFF inset, 0 0.5px 2px 0 #FFFFFF inset',
              pointerEvents: 'none',
            }}
            width="full"
          />
          <AnimatePresence initial={false}>
            {selectedCommand?.actionPage && (
              <Box
                as={motion.div}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -4 }}
                initial={{ opacity: 0, scale: 0.95, x: -4 }}
                key="actionsHint"
                style={{ willChange: 'transform' }}
                transition={springConfig}
              >
                <Box
                  alignItems="center"
                  as={motion.div}
                  background="transparent"
                  borderColor="transparent"
                  borderRadius="9px"
                  borderWidth="1px"
                  display="flex"
                  onClick={() =>
                    selectedCommand.actionPage &&
                    navigateTo(selectedCommand.actionPage, selectedCommand)
                  }
                  paddingLeft="3px"
                  paddingRight="7px"
                  style={{ height: 28, willChange: 'transform' }}
                  transition={timingConfig(0.15)}
                  whileHover={{
                    borderColor:
                      currentTheme === 'dark'
                        ? foregroundColors.fillTertiary.dark
                        : globalColors.grey20,
                  }}
                  whileTap={{ scale: 0.925 }}
                >
                  <Inline alignVertical="center" space="10px" wrap={false}>
                    <Inline wrap={false} alignVertical="center" space="4px">
                      <Box
                        alignItems="center"
                        as={motion.div}
                        background="transparent"
                        borderColor="separator"
                        borderRadius="5px"
                        borderWidth="1px"
                        display="flex"
                        justifyContent="center"
                        style={{ height: 20, width: 20 }}
                      >
                        <Text
                          align="center"
                          size="13pt (Non-Standard)"
                          color="labelTertiary"
                          weight="semibold"
                        >
                          ⌘
                        </Text>
                      </Box>
                      <Box
                        alignItems="center"
                        background="fillSecondary"
                        borderColor="separatorTertiary"
                        borderRadius="5px"
                        borderWidth="1px"
                        display="flex"
                        justifyContent="center"
                        paddingTop="1px"
                        style={{ height: 20, width: 20 }}
                      >
                        <Text
                          align="center"
                          size="12pt"
                          color="labelTertiary"
                          weight="bold"
                        >
                          ⏎
                        </Text>
                      </Box>
                    </Inline>
                    <Text color="labelTertiary" size="12pt" weight="bold">
                      {i18n.t('command_k.toolbar.actions_hint')}
                    </Text>
                  </Inline>
                </Box>
              </Box>
            )}
          </AnimatePresence>
          <Box display="flex" flexGrow="1" justifyContent="flex-end">
            <Box
              alignItems="center"
              as={motion.div}
              background="transparent"
              borderColor="transparent"
              borderRadius="9px"
              borderWidth="1px"
              display="flex"
              onClick={() => handleExecuteCommand(selectedCommand)}
              paddingLeft="7px"
              paddingRight="3px"
              style={{ height: 28, willChange: 'transform' }}
              transition={timingConfig(0.15)}
              whileHover={{
                borderColor:
                  currentTheme === 'dark'
                    ? foregroundColors.fillTertiary.dark
                    : globalColors.grey20,
              }}
              whileTap={{ scale: 0.925 }}
            >
              <Inline
                alignHorizontal="right"
                alignVertical="center"
                space="10px"
                wrap={false}
              >
                <Text align="right" color="label" size="12pt" weight="bold">
                  {selectedCommand?.actionLabel?.() ||
                    actionLabels.activateCommand()}
                </Text>
                <Box
                  alignItems="center"
                  background="fillSecondary"
                  borderColor="separatorTertiary"
                  borderRadius="5px"
                  borderWidth="1px"
                  display="flex"
                  justifyContent="center"
                  paddingTop="1px"
                  style={{ height: 20, width: 20 }}
                >
                  <Text
                    align="center"
                    size="12pt"
                    color="labelTertiary"
                    weight="bold"
                  >
                    ⏎
                  </Text>
                </Box>
              </Inline>
            </Box>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}
