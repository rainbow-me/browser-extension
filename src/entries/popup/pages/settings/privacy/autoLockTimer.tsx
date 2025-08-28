import React from 'react';

import { autoLockTimerOptions } from '~/core/references/autoLockTimer';
import { useSettingsStore } from '~/core/state/currentSettings/store';
import { AutoLockTimerOption } from '~/core/types/settings';
import { Box } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

export function AutoLockTimer() {
  const [autoLockTimer, setAutoLockTimer] = useSettingsStore('autoLockTimer');
  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          {Object.keys(autoLockTimerOptions).map((lockTimer, index) => (
            <MenuItem
              first={index === 0}
              last={index === Object.keys(autoLockTimerOptions).length - 1}
              rightComponent={
                autoLockTimer === lockTimer ? <MenuItem.SelectionIcon /> : null
              }
              key={lockTimer}
              titleComponent={
                <MenuItem.Title
                  text={
                    autoLockTimerOptions[lockTimer as AutoLockTimerOption].label
                  }
                />
              }
              onClick={() => setAutoLockTimer(lockTimer as AutoLockTimerOption)}
            />
          ))}
        </Menu>
      </MenuContainer>
    </Box>
  );
}
