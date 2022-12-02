import React from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { useDefaultTxSpeedStore } from '~/core/state/currentSettings/defaultTxSpeed';
import { useFlashbotsEnabledStore } from '~/core/state/currentSettings/flashbotsEnabled';
import { GasSpeed } from '~/core/types/gas';
import { DefaultTxSpeedOption } from '~/core/types/settings';
import { Box, Inline, Symbol, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';

export function Transactions() {
  const { defaultTxSpeed, setDefaultTxSpeed } = useDefaultTxSpeedStore();
  const { flashbotsEnabled, setFlashbotsEnabled } = useFlashbotsEnabledStore();
  const filteredTxSpeedOptionKeys = Object.values(GasSpeed).filter(
    (opt) => opt !== GasSpeed.CUSTOM,
  );
  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          <SwitchMenu
            align="end"
            renderMenuTrigger={
              <Box>
                <MenuItem
                  hasChevron
                  titleComponent={
                    <MenuItem.Title
                      text={i18n.t('transactions.default_speed')}
                    />
                  }
                  rightComponent={
                    <MenuItem.Selection
                      text={i18n.t(`transaction_fee.${defaultTxSpeed}`)}
                    />
                  }
                />
              </Box>
            }
            menuItemIndicator={
              <Symbol
                symbol="checkmark"
                size={12}
                color="label"
                weight="semibold"
              />
            }
            renderMenuItem={(option, i) => {
              return (
                <Box id={`switch-option-item-${i}`}>
                  <Inline space="8px" alignVertical="center">
                    <Inline alignVertical="center" space="8px">
                      <Text weight="medium" size="14pt">
                        {txSpeedEmoji[option as GasSpeed]}
                      </Text>
                    </Inline>
                    <Text weight="medium" size="14pt">
                      {i18n.t(`transaction_fee.${option}`)}
                    </Text>
                  </Inline>
                </Box>
              );
            }}
            menuItems={filteredTxSpeedOptionKeys}
            selectedValue={defaultTxSpeed}
            onValueChange={(value) => {
              setDefaultTxSpeed(value as DefaultTxSpeedOption);
            }}
          />
        </Menu>
        <Menu>
          <MenuItem
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
