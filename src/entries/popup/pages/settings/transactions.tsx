import React from 'react';

import { i18n } from '~/core/languages';
import {
  TxDefaultSpeedType,
  txDefaultSpeedOptions,
} from '~/core/references/txDefaultSpeed';
import { useFlashbotsEnabledStore } from '~/core/state/currentSettings/flashbotsEnabled';
import { useTxDefaultSpeedStore } from '~/core/state/currentSettings/txDefaultSpeed';
import { Box, Inline, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';

export function Transactions() {
  const { txDefaultSpeed, setTxDefaultSpeed } = useTxDefaultSpeedStore();
  const { flashbotsEnabled, setFlashbotsEnabled } = useFlashbotsEnabledStore();
  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
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
                      text={txDefaultSpeedOptions[txDefaultSpeed].label}
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
            selectedValue={txDefaultSpeed}
            onValueChange={(value) => {
              setTxDefaultSpeed(value as TxDefaultSpeedType);
            }}
          />
        </Menu>
        <Menu>
          <MenuItem
            hasSfSymbol
            rightComponent={
              <Toggle
                checked={flashbotsEnabled}
                handleChange={setFlashbotsEnabled}
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
  );
}
