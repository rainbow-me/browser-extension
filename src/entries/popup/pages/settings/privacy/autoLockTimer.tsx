import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { Box } from '~/design-system';
import { PageHeader } from '~/entries/popup/components/PageHeader/PageHeader';
import { menuTransition } from '~/entries/popup/utils/animation';

import { Menu } from '../../../components/Menu/Menu';
import { MenuContainer } from '../../../components/Menu/MenuContainer';
import { MenuItem } from '../../../components/Menu/MenuItem';

interface TimerOption {
  label: string;
  mins: number | null;
}

const timers: { [key: string]: TimerOption } = {
  immediately: {
    label: 'Immediately',
    mins: 0,
  },
  one_minute: {
    label: '1 minute',
    mins: 1,
  },
  five_minutes: {
    label: '5 minutes',
    mins: 5,
  },
  ten_minutes: {
    label: '10 minutes',
    mins: 10,
  },
  fifteen_minutes: {
    label: '15 minutes',
    mins: 15,
  },
  thirty_minutes: {
    label: '30 minutes',
    mins: 30,
  },
  one_hour: {
    label: '1 hour',
    mins: 60,
  },
  twelve_hours: {
    label: '12 hours',
    mins: 720,
  },
  twenty_four_hours: {
    label: '24 hours',
    mins: 1440,
  },
  none: {
    label: 'None',
    mins: null,
  },
};
export function AutolockTimer() {
  const [selectedLockTimer, setSelectedLockTimer] = useState('ten_minutes');
  return (
    <Box
      as={motion.div}
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={menuTransition}
    >
      <PageHeader
        title="Auto-Lock Timer"
        leftRoute="/settings/privacy"
        leftSymbol="arrowLeft"
      />
      <Box paddingHorizontal="20px">
        <MenuContainer testID="settings-menu-container">
          <Menu>
            {Object.keys(timers).map((lockTimer) => (
              <MenuItem
                rightComponent={
                  selectedLockTimer === lockTimer ? (
                    <MenuItem.SelectionIcon />
                  ) : null
                }
                key={timers[lockTimer].label}
                titleComponent={
                  <MenuItem.Title text={timers[lockTimer].label} />
                }
                onClick={() => setSelectedLockTimer(lockTimer)}
              />
            ))}
          </Menu>
        </MenuContainer>
      </Box>
    </Box>
  );
}
