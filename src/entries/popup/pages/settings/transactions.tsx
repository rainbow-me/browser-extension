import React from 'react';

import { i18n } from '~/core/languages';
import {
  DefaultTxSpeedType,
  defaultTxSpeedOptions,
} from '~/core/references/defaultTxSpeed';
import { useDefaultTxSpeedStore } from '~/core/state/currentSettings/defaultTxSpeed';
import { useFlashbotsEnabledStore } from '~/core/state/currentSettings/flashbotsEnabled';
import { Box, Inline, Text } from '~/design-system';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { SFSymbol } from '~/entries/popup/components/SFSymbol/SFSymbol';
import { SwitchMenu } from '~/entries/popup/components/SwitchMenu/SwitchMenu';

export function Transactions() {
  const { defaultTxSpeed, setDefaultTxSpeed } = useDefaultTxSpeedStore();
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
                      text={defaultTxSpeedOptions[defaultTxSpeed].label}
                    />
                  }
                />
              </Box>
            }
            menuItemIndicator={<SFSymbol symbol="checkMark" size={11} />}
            renderMenuItem={(option, i) => {
              const { label, emoji } =
                defaultTxSpeedOptions[option as DefaultTxSpeedType];

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
            menuItems={Object.keys(defaultTxSpeedOptions)}
            selectedValue={defaultTxSpeed}
            onValueChange={(value) => {
              setDefaultTxSpeed(value as DefaultTxSpeedType);
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
