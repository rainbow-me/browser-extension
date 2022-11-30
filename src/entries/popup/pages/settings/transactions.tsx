import { motion } from 'framer-motion';
import React from 'react';

import { i18n } from '~/core/languages';
import {
  TxDefaultSpeedType,
  txDefaultSpeedOptions,
} from '~/core/references/txDefaultSpeed';
import { useCurrentFlashbotsStore } from '~/core/state/currentSettings/currentFlashbots';
import { useCurrentTxDefaultSpeedStore } from '~/core/state/currentSettings/currentTxDefaultSpeed';
import { Box, Inline, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { PageHeader } from '~/entries/popup/components/PageHeader/PageHeader';
import { menuTransition } from '~/entries/popup/utils/animation';

import { Menu } from '../../components/Menu/Menu';
import { MenuContainer } from '../../components/Menu/MenuContainer';
import { MenuItem } from '../../components/Menu/MenuItem';
import { SFSymbol } from '../../components/SFSymbol/SFSymbol';
import { SwitchMenu } from '../../components/SwitchMenu/SwitchMenu';

export function Transactions() {
  const { currentTxDefaultSpeed, setCurrentTxDefaultSpeed } =
    useCurrentTxDefaultSpeedStore();
  const { currentFlashbots, setCurrentFlashbots } = useCurrentFlashbotsStore();
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader
        title="Transactions"
        leftRoute="/settings"
        leftSymbol="arrowLeft"
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            <SwitchMenu
              align="end"
              renderMenuTrigger={
                <Box>
                  <MenuItem
                    hasSfSymbol
                    hasChevron
                    titleComponent={
                      <MenuItem.Title
                        text={i18n.t('transactions.default_speed')}
                      />
                    }
                    rightComponent={
                      <MenuItem.Selection
                        text={
                          txDefaultSpeedOptions[currentTxDefaultSpeed].label
                        }
                      />
                    }
                  />
                </Box>
              }
              menuItemIndicator={<SFSymbol symbol="checkMark" size={11} />}
              renderMenuItem={(option, i) => {
                const { label, emoji } =
                  txDefaultSpeedOptions[option as TxDefaultSpeedType];

                return (
                  <Box id={`switch-option-item-${i}`}>
                    <Inline space="8px" alignVertical="center">
                      <Inline alignVertical="center" space="8px">
                        <Text weight="medium" size="14pt">
                          {emoji}
                        </Text>
                      </Inline>
                      <Text weight="medium" size="14pt">
                        {label}
                      </Text>
                    </Inline>
                  </Box>
                );
              }}
              menuItems={Object.keys(txDefaultSpeedOptions)}
              selectedValue={currentTxDefaultSpeed}
              onValueChange={(value) => {
                setCurrentTxDefaultSpeed(value as TxDefaultSpeedType);
              }}
            />
          </Menu>
          <Menu>
            <MenuItem
              hasSfSymbol
              rightComponent={
                <Toggle
                  checked={currentFlashbots}
                  handleChange={setCurrentFlashbots}
                />
              }
              titleComponent={
                <MenuItem.Title text={i18n.t('transactions.use_flashbots')} />
              }
            />
            <MenuItem.Description
              text={i18n.t('transactions.flashbots_description')}
            />
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
