import React from 'react';

import {
  AutoLockTimerOptionType,
  autoLockTimerOptions,
} from '~/core/references/autoLockTimer';
import { useAutoLockTimerStore } from '~/core/state/currentSettings/autoLockTimer';
import { Box } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';

export function AutolockTimer() {
  const { autoLockTimer, setAutoLockTimer } = useAutoLockTimerStore();
  return (
    <Box paddingHorizontal="20px">
      <MenuContainer testId="settings-menu-container">
        <Menu>
          {Object.keys(autoLockTimerOptions).map((lockTimer) => (
            <MenuItem
              rightComponent={
                autoLockTimer === lockTimer ? <MenuItem.SelectionIcon /> : null
              }
              key={lockTimer}
              titleComponent={
                <MenuItem.Title
                  text={
                    autoLockTimerOptions[lockTimer as AutoLockTimerOptionType]
                      .label
                  }
                />
              }
              onClick={() =>
                setAutoLockTimer(lockTimer as AutoLockTimerOptionType)
              }
            />
          ))}
        </Menu>
      </MenuContainer>
    </Box>
  );
}
