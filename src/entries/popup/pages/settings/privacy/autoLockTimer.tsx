import { motion } from 'framer-motion';
import React from 'react';

import {
  AutoLockTimerOptionType,
  autoLockTimerOptions,
} from '~/core/references/autoLockTimer';
import { usecurrentAutoLockTimerStore } from '~/core/state/currentSettings/currentAutoLockTimer';
import { Box } from '~/design-system';
import { Menu } from '~/entries/popup/components/Menu/Menu';
import { MenuContainer } from '~/entries/popup/components/Menu/MenuContainer';
import { MenuItem } from '~/entries/popup/components/Menu/MenuItem';
import { menuTransition } from '~/entries/popup/utils/animation';

export function AutolockTimer() {
  const { currentAutoLockTimer, setCurrentAutoLockTimer } =
    usecurrentAutoLockTimerStore();
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            {Object.keys(autoLockTimerOptions).map((lockTimer) => (
              <MenuItem
                rightComponent={
                  currentAutoLockTimer === lockTimer ? (
                    <MenuItem.SelectionIcon />
                  ) : null
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
                  setCurrentAutoLockTimer(lockTimer as AutoLockTimerOptionType)
                }
              />
            ))}
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
