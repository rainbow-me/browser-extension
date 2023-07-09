import { motion } from 'framer-motion';
import React from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { Box, Column, Columns, Inline, Symbol, Text } from '~/design-system';
import { transitions } from '~/design-system/styles/designTokens';

import {
  commandKRowHoverStyle,
  commandKRowHoverStyleDark,
  commandKRowSelectedStyle,
  commandKRowSelectedStyleDark,
} from './CommandKStyles.css';
import { ShortcutCommand } from './useCommands';

const SHORTCUT_ROW_HEIGHT = 40;

type ShortcutRowProps = {
  handleExecuteCommand: (command: ShortcutCommand) => void;
  shortcut: ShortcutCommand;
  selected: boolean;
};

export const ShortcutRow = React.memo(
  React.forwardRef<HTMLDivElement, ShortcutRowProps>(
    ({ handleExecuteCommand, shortcut, selected }, ref) => {
      const { currentTheme } = useCurrentThemeStore();
      const { featureFlags } = useFeatureFlagsStore();

      const {
        id,
        name,
        symbol,
        symbolSize,
        shortcut: { display } = { display: null },
      } = shortcut;

      const handleClick = React.useCallback(() => {
        handleExecuteCommand(shortcut);
      }, [handleExecuteCommand, shortcut]);

      return (
        <Box
          as={motion.div}
          style={{
            height: SHORTCUT_ROW_HEIGHT,
            marginLeft: 8,
            marginRight: 8,
            willChange: 'transform',
          }}
          transition={transitions.bounce}
          whileTap={{ scale: 0.97 }}
        >
          <Box
            aria-label={name}
            borderRadius="12px"
            className={`${
              selected && currentTheme === 'dark'
                ? commandKRowSelectedStyleDark
                : ''
            } ${
              selected && currentTheme !== 'dark'
                ? commandKRowSelectedStyle
                : ''
            }
            ${
              !selected && currentTheme === 'dark'
                ? commandKRowHoverStyleDark
                : ''
            }
            ${
              !selected && currentTheme !== 'dark' ? commandKRowHoverStyle : ''
            }`}
            id={id}
            onClick={handleClick}
            padding="10px"
            ref={ref}
            role="option"
          >
            <Columns alignVertical="center" space="8px">
              <Column width="content">
                <Box
                  alignItems="center"
                  display="flex"
                  justifyContent="center"
                  style={{ height: 20, width: 20 }}
                >
                  <Symbol
                    weight="semibold"
                    size={symbolSize ?? 15}
                    symbol={symbol}
                    color="label"
                  />
                </Box>
              </Column>
              <Text color="label" size="14pt" weight="semibold">
                {name}
              </Text>
              <Column width="content">
                <Inline space="4px">
                  {featureFlags.command_k_shortcuts_enabled &&
                    display &&
                    !selected && (
                      <Box
                        alignItems="center"
                        background="transparent"
                        borderColor="separatorSecondary"
                        borderRadius="5px"
                        borderWidth="1px"
                        display="flex"
                        justifyContent="center"
                        style={{ height: 20, width: 20 }}
                      >
                        <Text
                          align="center"
                          size="13pt (Non-Standard)"
                          color="labelQuaternary"
                          weight="semibold"
                        >
                          ⌘
                        </Text>
                      </Box>
                    )}
                  {(selected || display) && (
                    <Box
                      alignItems="center"
                      background="fillSecondary"
                      borderColor="separatorTertiary"
                      borderRadius="5px"
                      borderWidth="1px"
                      boxShadow={currentTheme === 'dark' ? '1px' : undefined}
                      display="flex"
                      justifyContent="center"
                      paddingTop="1px"
                      style={{ height: 20, width: 20 }}
                    >
                      {selected ? (
                        <Text
                          align="center"
                          size="12pt"
                          color="labelTertiary"
                          weight="bold"
                        >
                          ⏎
                        </Text>
                      ) : (
                        <Text
                          align="center"
                          size="12pt"
                          color="labelTertiary"
                          weight="semibold"
                        >
                          {display}
                        </Text>
                      )}
                    </Box>
                  )}
                </Inline>
              </Column>
            </Columns>
          </Box>
        </Box>
      );
    },
  ),
);

ShortcutRow.displayName = 'ShortcutRow';
